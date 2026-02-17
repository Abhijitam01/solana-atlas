const INSTRUCTION = {
  name: "update_uri",
  args: [{ name: "uri", type: "string" }],
  accounts: [
    { name: "metadata", isMut: true, isSigner: false },
    { name: "update_authority", isMut: false, isSigner: true },
    { name: "token_metadata_program", isMut: false, isSigner: false },
  ],
};

function norm(name) { return String(name || "").replace(/[_-]/g, "").toLowerCase(); }
function snakeToCamel(name) { return String(name).replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
function typeToString(type) { if (typeof type === "string") return type; return JSON.stringify(type); }
function findInstruction(idl, name) { const xs = Array.isArray(idl && idl.instructions) ? idl.instructions : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }
function findAccount(ix, name) { const xs = Array.isArray(ix && ix.accounts) ? ix.accounts : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }
function isMut(a) { return Boolean(a && (a.isMut || a.writable)); }
function isSigner(a) { return Boolean(a && (a.isSigner || a.signer)); }

describe("cpi-metadata behavior", () => {
  it("injects playground runtime context", () => { expect(program).to.exist; expect(provider).to.exist; });

  it("matches update_uri contract", () => {
    const ix = findInstruction(program.idl, INSTRUCTION.name);
    expect(ix).to.exist;
    const args = Array.isArray(ix.args) ? ix.args : [];
    expect(args.length).to.equal(1);
    expect(norm(args[0].name)).to.equal(norm("uri"));
    expect(typeToString(args[0].type)).to.equal("string");
    INSTRUCTION.accounts.forEach(function (acc) {
      const a = findAccount(ix, acc.name);
      expect(a).to.exist;
      expect(isMut(a)).to.equal(acc.isMut);
      expect(isSigner(a)).to.equal(acc.isSigner);
    });
  });

  it("exposes update_uri builder", () => {
    const m = program.methods || {};
    const builder = m[snakeToCamel("update_uri")]("https://example.com");
    expect(builder && builder.accounts).to.be.a("function");
    expect(builder && builder.rpc).to.be.a("function");
  });
});
