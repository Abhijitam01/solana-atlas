const INSTRUCTIONS = [
  {
    name: "initialize_vesting",
    args: [
      { name: "total_amount", type: "u64" },
      { name: "start_ts", type: "i64" },
      { name: "cliff_ts", type: "i64" },
      { name: "end_ts", type: "i64" },
    ],
    accounts: [
      { name: "vesting", isMut: true, isSigner: false },
      { name: "vault", isMut: true, isSigner: false },
      { name: "authority", isMut: true, isSigner: true },
      { name: "beneficiary", isMut: false, isSigner: false },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "fund",
    args: [{ name: "amount", type: "u64" }],
    accounts: [
      { name: "vesting", isMut: false, isSigner: false },
      { name: "vault", isMut: true, isSigner: false },
      { name: "funder", isMut: true, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "claim",
    args: [],
    accounts: [
      { name: "vesting", isMut: true, isSigner: false },
      { name: "vault", isMut: true, isSigner: false },
      { name: "beneficiary", isMut: true, isSigner: false },
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

describe("vesting-stream behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches vesting instruction argument and account contracts", () => {
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

  it("exposes builder APIs for initialize/fund/claim", () => {
    const methods = program.methods || {};

    const initializeBuilder = methods[snakeToCamel("initialize_vesting")](100, 1, 2, 3);
    expect(initializeBuilder && initializeBuilder.accounts).to.be.a("function");
    expect(initializeBuilder && initializeBuilder.rpc).to.be.a("function");

    const fundBuilder = methods[snakeToCamel("fund")](10);
    expect(fundBuilder && fundBuilder.accounts).to.be.a("function");
    expect(fundBuilder && fundBuilder.rpc).to.be.a("function");

    const claimBuilder = methods[snakeToCamel("claim")]();
    expect(claimBuilder && claimBuilder.accounts).to.be.a("function");
    expect(claimBuilder && claimBuilder.rpc).to.be.a("function");
  });

  it("exposes Vesting and Vault state schemas", () => {
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

    expect(asMap[norm("Vesting")], "Vesting schema missing").to.exist;
    expect(asMap[norm("Vault")], "Vault schema missing").to.exist;

    expect(asMap[norm("Vesting")][norm("total_amount")]).to.equal("u64");
    expect(asMap[norm("Vesting")][norm("released_amount")]).to.equal("u64");
    expect(asMap[norm("Vesting")][norm("start_ts")]).to.equal("i64");
    expect(asMap[norm("Vesting")][norm("cliff_ts")]).to.equal("i64");
    expect(asMap[norm("Vesting")][norm("end_ts")]).to.equal("i64");
    expect(asMap[norm("Vesting")][norm("bump")]).to.equal("u8");
    expect(asMap[norm("Vault")][norm("bump")]).to.equal("u8");
  });
});
