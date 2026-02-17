const INSTRUCTIONS = [
  {
    name: "initialize_pool",
    args: [],
    accounts: [
      { name: "pool", isMut: true, isSigner: false },
      { name: "authority", isMut: true, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "deposit",
    args: [{ name: "amount", type: "u64" }],
    accounts: [
      { name: "pool", isMut: true, isSigner: false },
      { name: "stake_account", isMut: true, isSigner: false },
      { name: "staker", isMut: true, isSigner: true },
      { name: "authority", isMut: false, isSigner: false },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "withdraw",
    args: [{ name: "shares", type: "u64" }],
    accounts: [
      { name: "pool", isMut: true, isSigner: false },
      { name: "stake_account", isMut: true, isSigner: false },
      { name: "staker", isMut: true, isSigner: true },
      { name: "authority", isMut: false, isSigner: false },
    ],
  },
];

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
  if (type && typeof type === "object" && type.array) {
    return "[" + typeToString(type.array[0]) + ";" + String(type.array[1]) + "]";
  }
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

describe("staking-pool behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches staking instruction argument and account contracts", () => {
    INSTRUCTIONS.forEach(function (expectedInstruction) {
      const instruction = findInstruction(program.idl, expectedInstruction.name);
      expect(instruction, "Instruction missing: " + expectedInstruction.name).to.exist;

      const actualArgs = Array.isArray(instruction.args) ? instruction.args : [];
      expect(actualArgs.length, expectedInstruction.name + " arg count mismatch").to.equal(expectedInstruction.args.length);

      expectedInstruction.args.forEach(function (expectedArg, index) {
        const actualArg = actualArgs[index];
        expect(actualArg, "Missing arg #" + index + " in " + expectedInstruction.name).to.exist;
        expect(norm(actualArg.name), expectedInstruction.name + " arg name mismatch").to.equal(norm(expectedArg.name));
        expect(typeToString(actualArg.type), expectedInstruction.name + " arg type mismatch").to.equal(expectedArg.type);
      });

      expectedInstruction.accounts.forEach(function (expectedAccount) {
        const actual = findAccount(instruction, expectedAccount.name);
        expect(actual, "Missing account " + expectedAccount.name + " in " + expectedInstruction.name).to.exist;
        expect(isMut(actual), expectedInstruction.name + "." + expectedAccount.name + " mutability mismatch").to.equal(expectedAccount.isMut);
        expect(isSigner(actual), expectedInstruction.name + "." + expectedAccount.name + " signer mismatch").to.equal(expectedAccount.isSigner);
      });
    });
  });

  it("exposes builder APIs for initialize_pool/deposit/withdraw", () => {
    const methods = program.methods || {};

    const initBuilder = methods[snakeToCamel("initialize_pool")]();
    expect(initBuilder && initBuilder.accounts).to.be.a("function");
    expect(initBuilder && initBuilder.rpc).to.be.a("function");

    const depositBuilder = methods[snakeToCamel("deposit")](10);
    expect(depositBuilder && depositBuilder.accounts).to.be.a("function");
    expect(depositBuilder && depositBuilder.rpc).to.be.a("function");

    const withdrawBuilder = methods[snakeToCamel("withdraw")](1);
    expect(withdrawBuilder && withdrawBuilder.accounts).to.be.a("function");
    expect(withdrawBuilder && withdrawBuilder.rpc).to.be.a("function");
  });

  it("exposes Pool and StakeAccount state schemas", () => {
    const accounts = Array.isArray(program.idl && program.idl.accounts) ? program.idl.accounts : [];
    const asMap = Object.fromEntries(
      accounts.map(function (acc) {
        const fields = Array.isArray(acc.type && acc.type.fields) ? acc.type.fields : [];
        return [
          norm(acc.name),
          Object.fromEntries(
            fields.map(function (field) {
              return [norm(field.name), typeToString(field.type)];
            })
          ),
        ];
      })
    );

    expect(asMap[norm("Pool")], "Pool schema missing").to.exist;
    expect(asMap[norm("StakeAccount")], "StakeAccount schema missing").to.exist;

    expect(asMap[norm("Pool")][norm("total_staked")]).to.equal("u64");
    expect(asMap[norm("Pool")][norm("total_shares")]).to.equal("u64");
    expect(asMap[norm("Pool")][norm("bump")]).to.equal("u8");
    expect(asMap[norm("StakeAccount")][norm("shares")]).to.equal("u64");
  });
});
