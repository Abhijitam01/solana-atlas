const INSTRUCTIONS = [
  { name: "initialize_dao", args: [{ name: "quorum", type: "u64" }] },
  { name: "create_proposal", args: [{ name: "proposal_id", type: "u64" }] },
  { name: "cast_vote", args: [{ name: "approve", type: "bool" }] },
  { name: "execute_proposal", args: [] },
];

function norm(name) { return String(name || "").replace(/[_-]/g, "").toLowerCase(); }
function snakeToCamel(name) { return String(name).replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
function typeToString(type) { if (typeof type === "string") return type; if (type && type.defined) return "defined:" + type.defined; return JSON.stringify(type); }
function findInstruction(idl, name) { const xs = Array.isArray(idl && idl.instructions) ? idl.instructions : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }

describe("governance-dao behavior", () => {
  it("injects playground runtime context", () => { expect(program).to.exist; expect(provider).to.exist; });

  it("matches governance instruction signatures", () => {
    INSTRUCTIONS.forEach(function (e) {
      const ix = findInstruction(program.idl, e.name);
      expect(ix, "Missing instruction " + e.name).to.exist;
      const args = Array.isArray(ix.args) ? ix.args : [];
      expect(args.length).to.equal(e.args.length);
      e.args.forEach(function (arg, i) {
        expect(norm(args[i].name)).to.equal(norm(arg.name));
        expect(typeToString(args[i].type)).to.equal(arg.type);
      });
    });
  });

  it("exposes proposal lifecycle builders", () => {
    const m = program.methods || {};
    expect(m[snakeToCamel("initialize_dao")](1).rpc).to.be.a("function");
    expect(m[snakeToCamel("create_proposal")](0).rpc).to.be.a("function");
    expect(m[snakeToCamel("cast_vote")](true).rpc).to.be.a("function");
    expect(m[snakeToCamel("execute_proposal")]().rpc).to.be.a("function");
  });

  it("exposes Dao/Proposal/VoteRecord schemas", () => {
    const accs = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const asMap = Object.fromEntries(accs.map(function (acc) {
      const fields = Array.isArray(acc.type && acc.type.fields) ? acc.type.fields : [];
      return [norm(acc.name), Object.fromEntries(fields.map(function (f) { return [norm(f.name), typeToString(f.type)]; }))];
    }));
    expect(asMap[norm("Dao")]).to.exist;
    expect(asMap[norm("Proposal")]).to.exist;
    expect(asMap[norm("VoteRecord")]).to.exist;
    expect(asMap[norm("Dao")][norm("quorum")]).to.equal("u64");
    expect(asMap[norm("Dao")][norm("proposal_count")]).to.equal("u64");
    expect(asMap[norm("Proposal")][norm("yes")]).to.equal("u64");
    expect(asMap[norm("Proposal")][norm("executed")]).to.equal("bool");
    expect(asMap[norm("VoteRecord")][norm("voted")]).to.equal("bool");
  });
});
