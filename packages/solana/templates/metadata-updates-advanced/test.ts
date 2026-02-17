const INSTRUCTION = {
  name: "update_metadata",
  args: [
    { name: "name", type: "string" },
    { name: "symbol", type: "string" },
    { name: "uri", type: "string" },
  ],
  accounts: [
    { name: "metadata", isMut: true, isSigner: false },
    { name: "update_authority", isMut: false, isSigner: true },
    { name: "token_metadata_program", isMut: false, isSigner: false },
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

describe("metadata-updates-advanced behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches advanced update_metadata argument and account contract", () => {
    const instruction = findInstruction(program.idl, INSTRUCTION.name);
    expect(instruction, "update_metadata should exist in IDL").to.exist;

    const actualArgs = Array.isArray(instruction.args) ? instruction.args : [];
    expect(actualArgs.length, "update_metadata arg count mismatch").to.equal(INSTRUCTION.args.length);

    INSTRUCTION.args.forEach(function (expectedArg, index) {
      const actualArg = actualArgs[index];
      expect(actualArg, "Missing arg #" + index + " in update_metadata").to.exist;
      expect(norm(actualArg.name), "update_metadata arg name mismatch").to.equal(norm(expectedArg.name));
      expect(typeToString(actualArg.type), "update_metadata arg type mismatch").to.equal(expectedArg.type);
    });

    INSTRUCTION.accounts.forEach(function (expectedAccount) {
      const actual = findAccount(instruction, expectedAccount.name);
      expect(actual, "Missing account " + expectedAccount.name + " in update_metadata").to.exist;
      expect(isMut(actual), "update_metadata." + expectedAccount.name + " mutability mismatch").to.equal(expectedAccount.isMut);
      expect(isSigner(actual), "update_metadata." + expectedAccount.name + " signer mismatch").to.equal(expectedAccount.isSigner);
    });
  });

  it("exposes update_metadata builder with accounts/rpc chain", () => {
    const methods = program.methods || {};
    const methodName = snakeToCamel(INSTRUCTION.name);
    const builder = methods[methodName]("Name", "SYM", "https://example.com/meta.json");
    expect(builder && builder.accounts).to.be.a("function");
    expect(builder && builder.rpc).to.be.a("function");
  });
});
