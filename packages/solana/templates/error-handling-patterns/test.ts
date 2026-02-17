const INSTRUCTIONS = [
  {
    name: "initialize",
    args: [{ name: "limit", type: "u64" }],
    accounts: [
      { name: "state", isMut: true, isSigner: false },
      { name: "authority", isMut: true, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "consume",
    args: [{ name: "amount", type: "u64" }],
    accounts: [
      { name: "state", isMut: true, isSigner: false },
      { name: "authority", isMut: false, isSigner: true },
    ],
  },
];

function norm(name) { return String(name || "").replace(/[_-]/g, "").toLowerCase(); }
function snakeToCamel(name) { return String(name).replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
function typeToString(type) { if (typeof type === "string") return type; return JSON.stringify(type); }
function findInstruction(idl, name) { const xs = Array.isArray(idl && idl.instructions) ? idl.instructions : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }
function findAccount(ix, name) { const xs = Array.isArray(ix && ix.accounts) ? ix.accounts : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }
function isMut(a) { return Boolean(a && (a.isMut || a.writable)); }
function isSigner(a) { return Boolean(a && (a.isSigner || a.signer)); }

describe("error-handling-patterns behavior", () => {
  it("injects playground runtime context", () => { expect(program).to.exist; expect(provider).to.exist; });

  it("matches initialize/consume contracts", () => {
    INSTRUCTIONS.forEach(function (e) {
      const ix = findInstruction(program.idl, e.name);
      expect(ix).to.exist;
      const args = Array.isArray(ix.args) ? ix.args : [];
      expect(args.length).to.equal(e.args.length);
      e.args.forEach(function (arg, i) {
        expect(norm(args[i].name)).to.equal(norm(arg.name));
        expect(typeToString(args[i].type)).to.equal(arg.type);
      });
      e.accounts.forEach(function (acc) {
        const a = findAccount(ix, acc.name);
        expect(a).to.exist;
        expect(isMut(a)).to.equal(acc.isMut);
        expect(isSigner(a)).to.equal(acc.isSigner);
      });
    });
  });

  it("exposes initialize/consume builders", () => {
    const m = program.methods || {};
    expect(m[snakeToCamel("initialize")](1).rpc).to.be.a("function");
    expect(m[snakeToCamel("consume")](1).rpc).to.be.a("function");
  });

  it("exposes UsageState schema", () => {
    const accs = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const s = accs.find(function (x) { return norm(x.name) === norm("UsageState"); });
    expect(s).to.exist;
    const fields = Array.isArray(s.type && s.type.fields) ? s.type.fields : [];
    const map = Object.fromEntries(fields.map(function (f) { return [norm(f.name), typeToString(f.type)]; }));
    expect(map[norm("limit")]).to.equal("u64");
    expect(map[norm("used")]).to.equal("u64");
  });
});
