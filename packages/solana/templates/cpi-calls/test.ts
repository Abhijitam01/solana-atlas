const INSTRUCTION = {
  name: "transfer_lamports",
  args: [{ name: "amount", type: "u64" }],
  accounts: [
    { name: "from", isMut: true, isSigner: true },
    { name: "to", isMut: true, isSigner: false },
    { name: "system_program", isMut: false, isSigner: false },
  ],
};

function norm(name) { return String(name || "").replace(/[_-]/g, "").toLowerCase(); }
function snakeToCamel(name) { return String(name).replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
function typeToString(type) { if (typeof type === "string") return type; return JSON.stringify(type); }
function findInstruction(idl, name) { const xs = Array.isArray(idl && idl.instructions) ? idl.instructions : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }
function findAccount(ix, name) { const xs = Array.isArray(ix && ix.accounts) ? ix.accounts : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }
function isMut(a) { return Boolean(a && (a.isMut || a.writable)); }
function isSigner(a) { return Boolean(a && (a.isSigner || a.signer)); }

describe("cpi-calls behavior", () => {
  it("injects playground runtime context", () => { expect(program).to.exist; expect(provider).to.exist; });

  it("matches transfer_lamports contract", () => {
    const ix = findInstruction(program.idl, INSTRUCTION.name);
    expect(ix).to.exist;
    const args = Array.isArray(ix.args) ? ix.args : [];
    expect(args.length).to.equal(1);
    expect(norm(args[0].name)).to.equal(norm("amount"));
    expect(typeToString(args[0].type)).to.equal("u64");
    INSTRUCTION.accounts.forEach(function (acc) {
      const a = findAccount(ix, acc.name);
      expect(a).to.exist;
      expect(isMut(a)).to.equal(acc.isMut);
      expect(isSigner(a)).to.equal(acc.isSigner);
    });
  });

  it("exposes transfer_lamports builder", () => {
    const m = program.methods || {};
    const builder = m[snakeToCamel("transfer_lamports")](1);
    expect(builder && builder.accounts).to.be.a("function");
    expect(builder && builder.rpc).to.be.a("function");
  });
});
