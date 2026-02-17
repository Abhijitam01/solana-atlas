const INSTRUCTIONS = [
  { name: "initialize", args: [{ name: "authority", type: "pubkey" }] },
  { name: "rotate_authority", args: [{ name: "new_authority", type: "pubkey" }] },
  { name: "freeze_authority", args: [] },
];

function norm(name) { return String(name || "").replace(/[_-]/g, "").toLowerCase(); }
function snakeToCamel(name) { return String(name).replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
function typeToString(type) { if (typeof type === "string") return type; return JSON.stringify(type); }
function findInstruction(idl, name) { const xs = Array.isArray(idl && idl.instructions) ? idl.instructions : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }

describe("upgrade-authority behavior", () => {
  it("injects playground runtime context", () => { expect(program).to.exist; expect(provider).to.exist; });

  it("matches authority instruction signatures", () => {
    INSTRUCTIONS.forEach(function (e) {
      const ix = findInstruction(program.idl, e.name);
      expect(ix).to.exist;
      const args = Array.isArray(ix.args) ? ix.args : [];
      expect(args.length).to.equal(e.args.length);
      e.args.forEach(function (arg, i) {
        const t = typeToString(args[i].type);
        expect(norm(args[i].name)).to.equal(norm(arg.name));
        expect(t === "publicKey" || t === "pubkey").to.equal(true);
      });
    });
  });

  it("exposes initialize/rotate/freeze builders", () => {
    const m = program.methods || {};
    const k = provider.wallet.publicKey;
    expect(m[snakeToCamel("initialize")](k).rpc).to.be.a("function");
    expect(m[snakeToCamel("rotate_authority")](k).rpc).to.be.a("function");
    expect(m[snakeToCamel("freeze_authority")]().rpc).to.be.a("function");
  });

  it("exposes UpgradeState schema", () => {
    const accs = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const s = accs.find(function (x) { return norm(x.name) === norm("UpgradeState"); });
    expect(s).to.exist;
    const fields = Array.isArray(s.type && s.type.fields) ? s.type.fields : [];
    const map = Object.fromEntries(fields.map(function (f) { return [norm(f.name), typeToString(f.type)]; }));
    const auth = map[norm("authority")];
    expect(auth === "publicKey" || auth === "pubkey").to.equal(true);
    expect(map[norm("frozen")]).to.equal("bool");
  });
});
