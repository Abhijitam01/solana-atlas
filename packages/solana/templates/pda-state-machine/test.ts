const INSTRUCTIONS = [
  { name: "initialize", args: [] },
  { name: "advance", args: [] },
  { name: "reset", args: [] },
];

function norm(name) { return String(name || "").replace(/[_-]/g, "").toLowerCase(); }
function snakeToCamel(name) { return String(name).replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
function typeToString(type) { if (typeof type === "string") return type; if (type && type.defined) return "defined:" + type.defined; return JSON.stringify(type); }
function findInstruction(idl, name) { const xs = Array.isArray(idl && idl.instructions) ? idl.instructions : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }

describe("pda-state-machine behavior", () => {
  it("injects playground runtime context", () => { expect(program).to.exist; expect(provider).to.exist; });

  it("matches initialize/advance/reset signatures", () => {
    INSTRUCTIONS.forEach(function (e) {
      const ix = findInstruction(program.idl, e.name);
      expect(ix).to.exist;
      const args = Array.isArray(ix.args) ? ix.args : [];
      expect(args.length).to.equal(0);
    });
  });

  it("exposes state machine builders", () => {
    const m = program.methods || {};
    expect(m[snakeToCamel("initialize")]().rpc).to.be.a("function");
    expect(m[snakeToCamel("advance")]().rpc).to.be.a("function");
    expect(m[snakeToCamel("reset")]().rpc).to.be.a("function");
  });

  it("exposes Machine schema", () => {
    const accs = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const machine = accs.find(function (x) { return norm(x.name) === norm("Machine"); });
    expect(machine).to.exist;
    const fields = Array.isArray(machine.type && machine.type.fields) ? machine.type.fields : [];
    const map = Object.fromEntries(fields.map(function (f) { return [norm(f.name), typeToString(f.type)]; }));
    expect(map[norm("bump")]).to.equal("u8");
    expect(map[norm("state")] === "defined:MachineState" || map[norm("state")] === "machineState").to.equal(true);
  });
});
