const INSTRUCTION = {
  name: "create_nft",
  args: [
    { name: "name", type: "string" },
    { name: "symbol", type: "string" },
    { name: "uri", type: "string" },
  ],
  accounts: [
    { name: "mint", isMut: true, isSigner: false },
    { name: "mint_authority", isMut: true, isSigner: true },
    { name: "payer", isMut: true, isSigner: true },
    { name: "metadata", isMut: true, isSigner: false },
    { name: "token_program", isMut: false, isSigner: false },
    { name: "token_metadata_program", isMut: false, isSigner: false },
    { name: "system_program", isMut: false, isSigner: false },
    { name: "rent", isMut: false, isSigner: false },
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

describe("nft-mint behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches create_nft argument and account contract", () => {
    const instruction = findInstruction(program.idl, INSTRUCTION.name);
    expect(instruction, "create_nft should exist in IDL").to.exist;

    const actualArgs = Array.isArray(instruction.args) ? instruction.args : [];
    expect(actualArgs.length, "create_nft arg count mismatch").to.equal(INSTRUCTION.args.length);

    INSTRUCTION.args.forEach(function (expectedArg, index) {
      const actualArg = actualArgs[index];
      expect(actualArg, "Missing arg #" + index + " in create_nft").to.exist;
      expect(norm(actualArg.name), "create_nft arg name mismatch").to.equal(norm(expectedArg.name));
      expect(typeToString(actualArg.type), "create_nft arg type mismatch").to.equal(expectedArg.type);
    });

    INSTRUCTION.accounts.forEach(function (expectedAccount) {
      const actual = findAccount(instruction, expectedAccount.name);
      expect(actual, "Missing account " + expectedAccount.name + " in create_nft").to.exist;
      expect(isMut(actual), "create_nft." + expectedAccount.name + " mutability mismatch").to.equal(expectedAccount.isMut);
      expect(isSigner(actual), "create_nft." + expectedAccount.name + " signer mismatch").to.equal(expectedAccount.isSigner);
    });
  });

  it("exposes create_nft builder with chained account/rpc methods", () => {
    const methods = program.methods || {};
    const methodName = snakeToCamel(INSTRUCTION.name);
    expect(methods[methodName], "program.methods." + methodName + " should exist").to.be.a("function");

    const builder = methods[methodName]("Demo NFT", "DNFT", "https://example.com/nft.json");
    expect(builder && builder.accounts).to.be.a("function");
    expect(builder && builder.rpc).to.be.a("function");
  });
});
