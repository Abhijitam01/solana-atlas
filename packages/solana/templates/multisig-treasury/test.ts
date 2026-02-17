const INSTRUCTIONS = [
  {
    name: "initialize_multisig",
    args: [{ name: "threshold", type: "u8" }],
    accounts: [
      { name: "multisig", isMut: true, isSigner: false },
      { name: "vault", isMut: true, isSigner: false },
      { name: "payer", isMut: true, isSigner: true },
      { name: "owner_one", isMut: false, isSigner: true },
      { name: "owner_two", isMut: false, isSigner: true },
      { name: "owner_three", isMut: false, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "deposit",
    args: [{ name: "amount", type: "u64" }],
    accounts: [
      { name: "multisig", isMut: false, isSigner: false },
      { name: "vault", isMut: true, isSigner: false },
      { name: "depositor", isMut: true, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "create_proposal",
    args: [{ name: "amount", type: "u64" }],
    accounts: [
      { name: "multisig", isMut: false, isSigner: false },
      { name: "vault", isMut: false, isSigner: false },
      { name: "proposal", isMut: true, isSigner: false },
      { name: "recipient", isMut: false, isSigner: false },
      { name: "proposer", isMut: true, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "approve",
    args: [],
    accounts: [
      { name: "multisig", isMut: false, isSigner: false },
      { name: "proposal", isMut: true, isSigner: false },
      { name: "owner", isMut: false, isSigner: true },
    ],
  },
  {
    name: "execute",
    args: [],
    accounts: [
      { name: "multisig", isMut: false, isSigner: false },
      { name: "vault", isMut: true, isSigner: false },
      { name: "proposal", isMut: true, isSigner: false },
      { name: "recipient", isMut: true, isSigner: false },
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
  if (type && typeof type === "object" && type.array) {
    return "[" + typeToString(type.array[0]) + ";" + String(type.array[1]) + "]";
  }
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

describe("multisig-treasury behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches multisig instruction argument and account contracts", () => {
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

  it("exposes builder APIs for full proposal lifecycle", () => {
    const methods = program.methods || {};

    const initializeBuilder = methods[snakeToCamel("initialize_multisig")](2);
    expect(initializeBuilder && initializeBuilder.accounts).to.be.a("function");
    expect(initializeBuilder && initializeBuilder.rpc).to.be.a("function");

    const depositBuilder = methods[snakeToCamel("deposit")](1);
    expect(depositBuilder && depositBuilder.accounts).to.be.a("function");
    expect(depositBuilder && depositBuilder.rpc).to.be.a("function");

    const createBuilder = methods[snakeToCamel("create_proposal")](1);
    expect(createBuilder && createBuilder.accounts).to.be.a("function");
    expect(createBuilder && createBuilder.rpc).to.be.a("function");

    const approveBuilder = methods[snakeToCamel("approve")]();
    expect(approveBuilder && approveBuilder.accounts).to.be.a("function");
    expect(approveBuilder && approveBuilder.rpc).to.be.a("function");

    const executeBuilder = methods[snakeToCamel("execute")]();
    expect(executeBuilder && executeBuilder.accounts).to.be.a("function");
    expect(executeBuilder && executeBuilder.rpc).to.be.a("function");
  });

  it("exposes Multisig, Vault, and Proposal state schemas", () => {
    const accounts = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const asMap = Object.fromEntries(
      accounts.map(function (acc) {
        const fields = Array.isArray(acc.type && acc.type.fields) ? acc.type.fields : [];
        return [
          norm(acc.name),
          Object.fromEntries(
            fields.map(function (field) {
              return [norm(field.name), typeToString(field.type)];
            })
          ),
        ];
      })
    );

    expect(asMap[norm("Multisig")], "Multisig schema missing").to.exist;
    expect(asMap[norm("Vault")], "Vault schema missing").to.exist;
    expect(asMap[norm("Proposal")], "Proposal schema missing").to.exist;

    expect(asMap[norm("Multisig")][norm("threshold")]).to.equal("u8");
    expect(asMap[norm("Multisig")][norm("bump")]).to.equal("u8");
    expect(asMap[norm("Vault")][norm("bump")]).to.equal("u8");
    expect(asMap[norm("Proposal")][norm("amount")]).to.equal("u64");
    expect(asMap[norm("Proposal")][norm("executed")]).to.equal("bool");
  });
});
