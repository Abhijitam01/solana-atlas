const INSTRUCTIONS = [
  { name: "create", args: [{ name: "amount", type: "u64" }] },
  { name: "release", args: [] },
];

function norm(name) { return String(name || "").replace(/[_-]/g, "").toLowerCase(); }
function snakeToCamel(name) { return String(name).replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
function typeToString(type) { if (typeof type === "string") return type; return JSON.stringify(type); }
function findInstruction(idl, name) { const xs = Array.isArray(idl && idl.instructions) ? idl.instructions : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }

describe("pda-escrow-multi-party behavior", () => {
  it("injects playground runtime context", () => { expect(program).to.exist; expect(provider).to.exist; });

  it("matches create/release signatures", () => {
    INSTRUCTIONS.forEach(function (e) {
      const ix = findInstruction(program.idl, e.name);
      expect(ix).to.exist;
      const args = Array.isArray(ix.args) ? ix.args : [];
      expect(args.length).to.equal(e.args.length);
      e.args.forEach(function (arg, i) {
        expect(norm(args[i].name)).to.equal(norm(arg.name));
        expect(typeToString(args[i].type)).to.equal(arg.type);
      });
    });
  });

  it("exposes create/release builders", () => {
    const m = program.methods || {};
    expect(m[snakeToCamel("create")](1).rpc).to.be.a("function");
    expect(m[snakeToCamel("release")]().rpc).to.be.a("function");
  });

  it("exposes Escrow schema", () => {
    const accs = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const e = accs.find(function (x) { return norm(x.name) === norm("Escrow"); });
    expect(e).to.exist;
    const fields = Array.isArray(e.type && e.type.fields) ? e.type.fields : [];
    const map = Object.fromEntries(fields.map(function (f) { return [norm(f.name), typeToString(f.type)]; }));
    expect(map[norm("amount")]).to.equal("u64");
    expect(map[norm("bump")]).to.equal("u8");
  });
});
