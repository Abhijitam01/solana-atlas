const INSTRUCTIONS = [
  {
    name: "initialize",
    args: [{ name: "admin", type: "publicKey" }],
    accounts: [
      { name: "state", isMut: true, isSigner: false },
      { name: "operator", isMut: true, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "set_operator",
    args: [{ name: "new_operator", type: "publicKey" }],
    accounts: [
      { name: "state", isMut: true, isSigner: false },
      { name: "admin", isMut: false, isSigner: true },
    ],
  },
  {
    name: "execute",
    args: [],
    accounts: [
      { name: "state", isMut: false, isSigner: false },
      { name: "operator", isMut: false, isSigner: true },
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

describe("authority-validation behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches role-management argument and account contracts", () => {
    INSTRUCTIONS.forEach(function (expectedInstruction) {
      const instruction = findInstruction(program.idl, expectedInstruction.name);
      expect(instruction, "Instruction missing: " + expectedInstruction.name).to.exist;

      const actualArgs = Array.isArray(instruction.args) ? instruction.args : [];
      expect(actualArgs.length, expectedInstruction.name + " arg count mismatch").to.equal(expectedInstruction.args.length);

      expectedInstruction.args.forEach(function (expectedArg, index) {
        const actualArg = actualArgs[index];
        expect(actualArg, "Missing arg #" + index + " in " + expectedInstruction.name).to.exist;
        expect(norm(actualArg.name), expectedInstruction.name + " arg name mismatch").to.equal(norm(expectedArg.name));
        expect(
          typeToString(actualArg.type) === expectedArg.type || typeToString(actualArg.type) === "pubkey",
          expectedInstruction.name + " arg type mismatch"
        ).to.equal(true);
      });

      expectedInstruction.accounts.forEach(function (expectedAccount) {
        const actual = findAccount(instruction, expectedAccount.name);
        expect(actual, "Missing account " + expectedAccount.name + " in " + expectedInstruction.name).to.exist;
        expect(isMut(actual), expectedInstruction.name + "." + expectedAccount.name + " mutability mismatch").to.equal(expectedAccount.isMut);
        expect(isSigner(actual), expectedInstruction.name + "." + expectedAccount.name + " signer mismatch").to.equal(expectedAccount.isSigner);
      });
    });
  });

  it("exposes builder APIs for initialize/set_operator/execute", () => {
    const methods = program.methods || {};
    const key = provider.wallet.publicKey;

    const initializeBuilder = methods[snakeToCamel("initialize")](key);
    expect(initializeBuilder && initializeBuilder.accounts).to.be.a("function");
    expect(initializeBuilder && initializeBuilder.rpc).to.be.a("function");

    const setOperatorBuilder = methods[snakeToCamel("set_operator")](key);
    expect(setOperatorBuilder && setOperatorBuilder.accounts).to.be.a("function");
    expect(setOperatorBuilder && setOperatorBuilder.rpc).to.be.a("function");

    const executeBuilder = methods[snakeToCamel("execute")]();
    expect(executeBuilder && executeBuilder.accounts).to.be.a("function");
    expect(executeBuilder && executeBuilder.rpc).to.be.a("function");
  });

  it("exposes AuthorityState with admin and operator pubkeys", () => {
    const accounts = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const state = accounts.find(function (entry) {
      return norm(entry.name) === norm("AuthorityState");
    });

    expect(state, "AuthorityState definition should exist in IDL").to.exist;
    const fields = Array.isArray(state.type && state.type.fields) ? state.type.fields : [];
    const fieldMap = Object.fromEntries(
      fields.map(function (field) {
        return [norm(field.name), typeToString(field.type)];
      })
    );

    const adminType = fieldMap[norm("admin")];
    const operatorType = fieldMap[norm("operator")];
    expect(adminType === "pubkey" || adminType === "publicKey").to.equal(true);
    expect(operatorType === "pubkey" || operatorType === "publicKey").to.equal(true);
  });
});
