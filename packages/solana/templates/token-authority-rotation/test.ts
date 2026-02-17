const INSTRUCTIONS = [
  {
    name: "initialize",
    args: [],
    accounts: [
      { name: "state", isMut: true, isSigner: false },
      { name: "current_authority", isMut: true, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "rotate_mint_authority",
    args: [],
    accounts: [
      { name: "state", isMut: true, isSigner: false },
      { name: "mint", isMut: true, isSigner: false },
      { name: "current_authority", isMut: true, isSigner: true },
      { name: "new_authority", isMut: false, isSigner: false },
      { name: "token_program", isMut: false, isSigner: false },
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

describe("token-authority-rotation behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches initialize/rotate account contracts", () => {
    INSTRUCTIONS.forEach(function (expectedInstruction) {
      const instruction = findInstruction(program.idl, expectedInstruction.name);
      expect(instruction, "Instruction missing: " + expectedInstruction.name).to.exist;
      const actualArgs = Array.isArray(instruction.args) ? instruction.args : [];
      expect(actualArgs.length, expectedInstruction.name + " should not take args").to.equal(0);

      expectedInstruction.accounts.forEach(function (expectedAccount) {
        const actual = findAccount(instruction, expectedAccount.name);
        expect(actual, "Missing account " + expectedAccount.name + " in " + expectedInstruction.name).to.exist;
        expect(isMut(actual), expectedInstruction.name + "." + expectedAccount.name + " mutability mismatch").to.equal(expectedAccount.isMut);
        expect(isSigner(actual), expectedInstruction.name + "." + expectedAccount.name + " signer mismatch").to.equal(expectedAccount.isSigner);
      });
    });
  });

  it("exposes builder APIs for initialize and rotate_mint_authority", () => {
    const methods = program.methods || {};

    const initBuilder = methods[snakeToCamel("initialize")]();
    expect(initBuilder && initBuilder.accounts).to.be.a("function");
    expect(initBuilder && initBuilder.rpc).to.be.a("function");

    const rotateBuilder = methods[snakeToCamel("rotate_mint_authority")]();
    expect(rotateBuilder && rotateBuilder.accounts).to.be.a("function");
    expect(rotateBuilder && rotateBuilder.rpc).to.be.a("function");
  });

  it("exposes RotationState.current_authority in account schema", () => {
    const accounts = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const state = accounts.find(function (entry) {
      return norm(entry.name) === norm("RotationState");
    });

    expect(state, "RotationState schema missing").to.exist;
    const fields = Array.isArray(state.type && state.type.fields) ? state.type.fields : [];
    const fieldMap = Object.fromEntries(
      fields.map(function (field) {
        return [norm(field.name), typeToString(field.type)];
      })
    );

    const authorityType = fieldMap[norm("current_authority")];
    expect(authorityType === "pubkey" || authorityType === "publicKey").to.equal(true);
  });
});
