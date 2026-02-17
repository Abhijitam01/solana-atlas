const INSTRUCTIONS = [
  {
    name: "freeze",
    args: [],
    accounts: [
      { name: "token_account", isMut: true, isSigner: false },
      { name: "mint", isMut: false, isSigner: false },
      { name: "freeze_authority", isMut: false, isSigner: true },
      { name: "token_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "thaw",
    args: [],
    accounts: [
      { name: "token_account", isMut: true, isSigner: false },
      { name: "mint", isMut: false, isSigner: false },
      { name: "freeze_authority", isMut: false, isSigner: true },
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

describe("token-freeze-authority behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches freeze/thaw account contracts", () => {
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

  it("exposes builder APIs for freeze and thaw", () => {
    const methods = program.methods || {};
    const freezeBuilder = methods[snakeToCamel("freeze")]();
    expect(freezeBuilder && freezeBuilder.accounts).to.be.a("function");
    expect(freezeBuilder && freezeBuilder.rpc).to.be.a("function");

    const thawBuilder = methods[snakeToCamel("thaw")]();
    expect(thawBuilder && thawBuilder.accounts).to.be.a("function");
    expect(thawBuilder && thawBuilder.rpc).to.be.a("function");
  });
});
