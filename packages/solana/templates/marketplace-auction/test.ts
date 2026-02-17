const INSTRUCTIONS = [
  {
    name: "initialize_auction",
    args: [
      { name: "min_bid", type: "u64" },
      { name: "end_ts", type: "i64" },
    ],
    accounts: [
      { name: "auction", isMut: true, isSigner: false },
      { name: "vault", isMut: true, isSigner: false },
      { name: "seller", isMut: true, isSigner: true },
      { name: "system_program", isMut: false, isSigner: false },
    ],
  },
  {
    name: "place_bid",
    args: [{ name: "amount", type: "u64" }],
    accounts: [
      { name: "auction", isMut: true, isSigner: false },
      { name: "vault", isMut: true, isSigner: false },
      { name: "bidder", isMut: true, isSigner: true },
      { name: "previous_bidder", isMut: true, isSigner: false },
    ],
  },
  {
    name: "settle",
    args: [],
    accounts: [
      { name: "auction", isMut: true, isSigner: false },
      { name: "vault", isMut: true, isSigner: false },
      { name: "seller", isMut: true, isSigner: true },
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

describe("marketplace-auction behavior", () => {
  it("injects playground runtime context", () => {
    expect(program).to.exist;
    expect(provider).to.exist;
    expect(expect).to.be.a("function");
    expect(assert).to.be.an("object");
  });

  it("matches auction instruction argument and account contracts", () => {
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

  it("exposes builder APIs for initialize_auction/place_bid/settle", () => {
    const methods = program.methods || {};

    const initializeBuilder = methods[snakeToCamel("initialize_auction")](1, 9999999999);
    expect(initializeBuilder && initializeBuilder.accounts).to.be.a("function");
    expect(initializeBuilder && initializeBuilder.rpc).to.be.a("function");

    const placeBidBuilder = methods[snakeToCamel("place_bid")](2);
    expect(placeBidBuilder && placeBidBuilder.accounts).to.be.a("function");
    expect(placeBidBuilder && placeBidBuilder.rpc).to.be.a("function");

    const settleBuilder = methods[snakeToCamel("settle")]();
    expect(settleBuilder && settleBuilder.accounts).to.be.a("function");
    expect(settleBuilder && settleBuilder.rpc).to.be.a("function");
  });

  it("exposes Auction and Vault state schemas", () => {
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

    expect(asMap[norm("Auction")], "Auction schema missing").to.exist;
    expect(asMap[norm("Vault")], "Vault schema missing").to.exist;

    expect(asMap[norm("Auction")][norm("min_bid")]).to.equal("u64");
    expect(asMap[norm("Auction")][norm("end_ts")]).to.equal("i64");
    expect(asMap[norm("Auction")][norm("highest_bid")]).to.equal("u64");
    expect(asMap[norm("Auction")][norm("settled")]).to.equal("bool");
    expect(asMap[norm("Auction")][norm("bump")]).to.equal("u8");
    expect(asMap[norm("Vault")][norm("bump")]).to.equal("u8");
  });
});
