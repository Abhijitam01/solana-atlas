const INSTRUCTIONS = [
  {
    name: "initialize",
    args: [{ name: "data", type: "u64" }],
    accounts: [
      { name: "my_account", isMut: true, isSigner: false },
      { name: "user", isMut: true, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "update",
    args: [{ name: "new_data", type: "u64" }],
    accounts: [
      { name: "my_account", isMut: true, isSigner: false },
      { name: "user", isMut: false, isSigner: true },
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

describe("account-init behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches expected instruction arguments and account constraints", () => {
    INSTRUCTIONS.forEach(function (expectedInstruction) {
      const instruction = findInstruction(program.idl, expectedInstruction.name);
      expect(instruction, "Instruction missing: " + expectedInstruction.name).to.exist;

      const actualArgs = Array.isArray(instruction.args) ? instruction.args : [];
      expect(
        actualArgs.length,
        expectedInstruction.name + " arg count mismatch"
      ).to.equal(expectedInstruction.args.length);

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

  it("exposes builder APIs for initialize and update", () => {
    const methods = program.methods || {};
    INSTRUCTIONS.forEach(function (instruction) {
      const methodName = snakeToCamel(instruction.name);
      expect(methods[methodName], "program.methods." + methodName + " should exist").to.be.a("function");
      const builder = methods[methodName](123);
      expect(builder && builder.accounts, methodName + " builder.accounts() should exist").to.be.a("function");
      expect(builder && builder.rpc, methodName + " builder.rpc() should exist").to.be.a("function");
    });
  });

  it("exposes MyAccount state with expected fields", () => {
    const accounts = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const myAccount = accounts.find(function (entry) {
      return norm(entry.name) === norm("MyAccount");
    });

    expect(myAccount, "MyAccount state definition should exist in IDL").to.exist;
    const fields = Array.isArray(myAccount.type && myAccount.type.fields) ? myAccount.type.fields : [];
    const fieldMap = Object.fromEntries(
      fields.map(function (field) {
        return [norm(field.name), typeToString(field.type)];
      })
    );

    expect(fieldMap[norm("data")]).to.equal("u64");
    expect(
      fieldMap[norm("authority")] === "pubkey" || fieldMap[norm("authority")] === "publicKey"
    ).to.equal(true);
  });
});
