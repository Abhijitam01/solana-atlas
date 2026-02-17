const INSTRUCTIONS = [
  {
    name: "initialize_pool",
    args: [],
    accounts: [
      { name: "pool", isMut: true, isSigner: false },
      { name: "pool_authority", isMut: false, isSigner: false },
      { name: "mint_a", isMut: false, isSigner: false },
      { name: "mint_b", isMut: false, isSigner: false },
      { name: "vault_a", isMut: true, isSigner: false },
      { name: "vault_b", isMut: true, isSigner: false },
      { name: "payer", isMut: true, isSigner: true },
      { name: "token_program", isMut: false, isSigner: false },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "swap",
    args: [{ name: "amount_in", type: "u64" }],
    accounts: [
      { name: "pool", isMut: false, isSigner: false },
      { name: "pool_authority", isMut: false, isSigner: false },
      { name: "vault_in", isMut: true, isSigner: false },
      { name: "vault_out", isMut: true, isSigner: false },
      { name: "user_in", isMut: true, isSigner: false },
      { name: "user_out", isMut: true, isSigner: false },
      { name: "user", isMut: false, isSigner: true },
      { name: "token_program", isMut: false, isSigner: false },
    ],
  },
];

function norm(name) { return String(name || "").replace(/[_-]/g, "").toLowerCase(); }
function snakeToCamel(name) { return String(name).replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
function typeToString(type) { if (typeof type === "string") return type; if (type && typeof type === "object" && type.defined) return "defined:" + type.defined; return JSON.stringify(type); }
function findInstruction(idl, name) { const xs = Array.isArray(idl && idl.instructions) ? idl.instructions : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }
function findAccount(ix, name) { const xs = Array.isArray(ix && ix.accounts) ? ix.accounts : []; return xs.find(function (x) { return norm(x.name) === norm(name); }); }
function isMut(a) { return Boolean(a && (a.isMut || a.writable)); }
function isSigner(a) { return Boolean(a && (a.isSigner || a.signer)); }

describe("amm-swap behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist; expect(provider).to.exist; expect(expect).to.be.a("function"); expect(assert).to.be.an("object");
  });

  it("matches AMM instruction contracts", () => {
    INSTRUCTIONS.forEach(function (e) {
      const ix = findInstruction(program.idl, e.name);
      expect(ix, "Instruction missing: " + e.name).to.exist;
      const args = Array.isArray(ix.args) ? ix.args : [];
      expect(args.length, e.name + " arg count mismatch").to.equal(e.args.length);
      e.args.forEach(function (arg, i) {
        expect(args[i], "Missing arg #" + i + " in " + e.name).to.exist;
        expect(norm(args[i].name)).to.equal(norm(arg.name));
        expect(typeToString(args[i].type)).to.equal(arg.type);
      });
      e.accounts.forEach(function (acc) {
        const a = findAccount(ix, acc.name);
        expect(a, "Missing account " + acc.name + " in " + e.name).to.exist;
        expect(isMut(a)).to.equal(acc.isMut);
        expect(isSigner(a)).to.equal(acc.isSigner);
      });
    });
  });

  it("exposes initialize_pool and swap builders", () => {
    const m = program.methods || {};
    expect(m[snakeToCamel("initialize_pool")]).to.be.a("function");
    expect(m[snakeToCamel("swap")]).to.be.a("function");
    const a = m[snakeToCamel("initialize_pool")]();
    const b = m[snakeToCamel("swap")](1);
    expect(a && a.accounts).to.be.a("function"); expect(a && a.rpc).to.be.a("function");
    expect(b && b.accounts).to.be.a("function"); expect(b && b.rpc).to.be.a("function");
  });

  it("exposes Pool state schema", () => {
    const accs = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const pool = accs.find(function (x) { return norm(x.name) === norm("Pool"); });
    expect(pool).to.exist;
    const fields = Array.isArray(pool.type && pool.type.fields) ? pool.type.fields : [];
    const map = Object.fromEntries(fields.map(function (f) { return [norm(f.name), typeToString(f.type)]; }));
    expect(map[norm("bump")]).to.equal("u8");
    ["authority", "mint_a", "mint_b", "vault_a", "vault_b"].forEach(function (k) {
      const t = map[norm(k)];
      expect(t === "pubkey" || t === "publicKey").to.equal(true);
    });
  });
});
