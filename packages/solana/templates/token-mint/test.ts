const INSTRUCTIONS = [
  {
    name: "create_mint",
    args: [],
    accounts: [
      { name: "mint", isMut: true, isSigner: false },
      { name: "payer", isMut: true, isSigner: true },
      { name: "mint_authority", isMut: false, isSigner: true },
      { name: "token_program", isMut: false, isSigner: false },
      { name: "system_program", isMut: false, isSigner: false },
      { name: "rent", isMut: false, isSigner: false },
    ],
  },
  {
    name: "mint_tokens",
    args: [{ name: "amount", type: "u64" }],
    accounts: [
      { name: "mint", isMut: true, isSigner: false },
      { name: "token_account", isMut: true, isSigner: false },
      { name: "mint_authority", isMut: false, isSigner: true },
      { name: "token_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "transfer_tokens",
    args: [{ name: "amount", type: "u64" }],
    accounts: [
      { name: "from", isMut: true, isSigner: false },
      { name: "to", isMut: true, isSigner: false },
      { name: "authority", isMut: false, isSigner: true },
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

describe("token-mint behavior", () => {
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

  it("exposes builder APIs for mint lifecycle", () => {
    const methods = program.methods || {};

    const createMintBuilder = methods[snakeToCamel("create_mint")]();
    expect(createMintBuilder && createMintBuilder.accounts).to.be.a("function");
    expect(createMintBuilder && createMintBuilder.rpc).to.be.a("function");

    const mintTokensBuilder = methods[snakeToCamel("mint_tokens")](1);
    expect(mintTokensBuilder && mintTokensBuilder.accounts).to.be.a("function");
    expect(mintTokensBuilder && mintTokensBuilder.rpc).to.be.a("function");

    const transferBuilder = methods[snakeToCamel("transfer_tokens")](1);
    expect(transferBuilder && transferBuilder.accounts).to.be.a("function");
    expect(transferBuilder && transferBuilder.rpc).to.be.a("function");
  });
});
