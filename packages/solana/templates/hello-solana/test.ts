const INSTRUCTION = {
  name: "say_hello",
  args: [],
  accounts: [
    { name: "user", isMut: true, isSigner: true },
    { name: "system_program", isMut: false, isSigner: false },
  ],
};

function norm(name) {
  return String(name || "").replace(/[_-]/g, "").toLowerCase();
}

function snakeToCamel(name) {
  return String(name).replace(/_([a-z])/g, function (_, c) {
    return c.toUpperCase();
  });
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

describe("hello-solana behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("defines say_hello instruction with expected accounts and no args", () => {
    const instruction = findInstruction(program.idl, INSTRUCTION.name);
    expect(instruction, "say_hello should exist in IDL").to.exist;

    const args = Array.isArray(instruction.args) ? instruction.args : [];
    expect(args.length, "say_hello should not take arguments").to.equal(0);

    INSTRUCTION.accounts.forEach(function (expectedAccount) {
      const actual = findAccount(instruction, expectedAccount.name);
      expect(actual, "Missing account " + expectedAccount.name).to.exist;
      expect(isMut(actual), expectedAccount.name + " mutability mismatch").to.equal(expectedAccount.isMut);
      expect(isSigner(actual), expectedAccount.name + " signer mismatch").to.equal(expectedAccount.isSigner);
    });
  });

  it("exposes a runnable method builder for say_hello", () => {
    const methods = program.methods || {};
    const methodName = snakeToCamel(INSTRUCTION.name);
    expect(methods[methodName], "program.methods." + methodName + " should exist").to.be.a("function");

    const builder = methods[methodName]();
    expect(builder && builder.accounts, "builder.accounts() should exist").to.be.a("function");
    expect(builder && builder.rpc, "builder.rpc() should exist").to.be.a("function");
  });
});
