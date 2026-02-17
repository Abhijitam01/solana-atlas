const INSTRUCTIONS = [
  {
    name: "create",
    args: [{ name: "amount", type: "u64" }],
    accounts: [
      { name: "escrow", isMut: true, isSigner: false },
      { name: "authority", isMut: true, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "release",
    args: [],
    accounts: [
      { name: "escrow", isMut: true, isSigner: false },
      { name: "authority", isMut: true, isSigner: true },
    ],
  },
];

function norm(name) {
  return String(name || "").replace(/[_-]/g, "").toLowerCase();
}

function snakeToCamel(name) {
  return String(name).replace(/_([a-z])/g, function (_, c) {
    return c.toUpperCase();
  });
}

function typeToString(type) {
  if (typeof type === "string") return type;
  if (type && typeof type === "object" && type.defined) return "defined:" + type.defined;
  return JSON.stringify(type);
}

function findInstruction(idl, name) {
  const instructions = Array.isArray(idl && idl.instructions) ? idl.instructions : [];
  return instructions.find(function (entry) {
    return norm(entry.name) === norm(name);
  });
}

function findAccount(instruction, accountName) {
  const accounts = Array.isArray(instruction && instruction.accounts) ? instruction.accounts : [];
  return accounts.find(function (entry) {
    return norm(entry.name) === norm(accountName);
  });
}

function isMut(entry) {
  return Boolean(entry && (entry.isMut || entry.writable));
}

function isSigner(entry) {
  return Boolean(entry && (entry.isSigner || entry.signer));
}

describe("pda-escrow behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches create/release argument and account contracts", () => {
    INSTRUCTIONS.forEach(function (expectedInstruction) {
      const instruction = findInstruction(program.idl, expectedInstruction.name);
      expect(instruction, "Instruction missing: " + expectedInstruction.name).to.exist;

      const actualArgs = Array.isArray(instruction.args) ? instruction.args : [];
      expect(actualArgs.length, expectedInstruction.name + " arg count mismatch").to.equal(expectedInstruction.args.length);

      expectedInstruction.args.forEach(function (expectedArg, index) {
        const actualArg = actualArgs[index];
        expect(actualArg, "Missing arg #" + index + " in " + expectedInstruction.name).to.exist;
        expect(norm(actualArg.name), expectedInstruction.name + " arg name mismatch").to.equal(norm(expectedArg.name));
        expect(typeToString(actualArg.type), expectedInstruction.name + " arg type mismatch").to.equal(expectedArg.type);
      });

      expectedInstruction.accounts.forEach(function (expectedAccount) {
        const actual = findAccount(instruction, expectedAccount.name);
        expect(actual, "Missing account " + expectedAccount.name + " in " + expectedInstruction.name).to.exist;
        expect(isMut(actual), expectedInstruction.name + "." + expectedAccount.name + " mutability mismatch").to.equal(expectedAccount.isMut);
        expect(isSigner(actual), expectedInstruction.name + "." + expectedAccount.name + " signer mismatch").to.equal(expectedAccount.isSigner);
      });
    });
  });

  it("exposes builder APIs for create and release", () => {
    const methods = program.methods || {};

    const createBuilder = methods[snakeToCamel("create")](1);
    expect(createBuilder && createBuilder.accounts).to.be.a("function");
    expect(createBuilder && createBuilder.rpc).to.be.a("function");

    const releaseBuilder = methods[snakeToCamel("release")]();
    expect(releaseBuilder && releaseBuilder.accounts).to.be.a("function");
    expect(releaseBuilder && releaseBuilder.rpc).to.be.a("function");
  });

  it("exposes Escrow state with authority/amount/bump fields", () => {
    const accounts = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const escrow = accounts.find(function (entry) {
      return norm(entry.name) === norm("Escrow");
    });

    expect(escrow, "Escrow state definition should exist in IDL").to.exist;
    const fields = Array.isArray(escrow.type && escrow.type.fields) ? escrow.type.fields : [];
    const fieldMap = Object.fromEntries(
      fields.map(function (field) {
        return [norm(field.name), typeToString(field.type)];
      })
    );

    expect(
      fieldMap[norm("authority")] === "pubkey" || fieldMap[norm("authority")] === "publicKey"
    ).to.equal(true);
    expect(fieldMap[norm("amount")]).to.equal("u64");
    expect(fieldMap[norm("bump")]).to.equal("u8");
  });
});
