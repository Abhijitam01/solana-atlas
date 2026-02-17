import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import type { ExecutionResult, Template } from "@solana-playground/types";
import type { ExecutionScenarioInput, ExecutionAdapter } from "../execution-engine";
import { ValidatorManager } from "../validator";
import { ProgramCompiler } from "../compiler";
import { StateCapture } from "../state-capture";
import { execFile } from "child_process";
import { promisify } from "util";
const anchor = require("@coral-xyz/anchor") as any;
import { parseTransactionLogs } from "../trace";
import { WorkspaceManager } from "../workspace";

const execFileAsync = promisify(execFile);

interface ResolvedAccounts {
  accounts: Record<string, PublicKey>;
  signers: Keypair[];
  labels: Array<{ address: PublicKey; label: string }>;
}

const SUPPORTED_TEMPLATES = new Set([
  "hello-solana",
  "pda-vault",
  "account-init",
]);

export class LocalValidatorAdapter implements ExecutionAdapter {
  private validatorManager: ValidatorManager | null = null;
  private connection: Connection | null = null;
  private payer: Keypair | null = null;
  private accountCache: Map<string, PublicKey> = new Map();
  private signerCache: Map<string, Keypair> = new Map();
  private workspaceManager = new WorkspaceManager();

  async executeScenario(input: ExecutionScenarioInput): Promise<ExecutionResult> {
    return this.executeCommon(input.template, input.scenarioName, async (program, programId, payer, stateCapture) => {
      // Resolve accounts and capture initial state
      const resolved = await this.resolveAccounts(input.template, input.instruction, programId, payer);
      const before = await stateCapture.captureMultipleAccounts(resolved.labels);

      // Execute instruction (with optional bootstrap for dependent flows)
      await this.executeWithPrerequisites(program, input, programId, payer);

      return { before, resolved };
    });
  }

  async executeTransaction(input: ExecutionTransactionInput): Promise<ExecutionResult> {
    const { template, transaction } = input;
    return this.executeCommon(template, "custom-transaction", async (program, programId, payer, stateCapture) => {
      // Resolve accounts for all instructions
      // For now, we'll assume a single instruction execution or sequential execution
      // capturing state before/after the WHOLE transaction
      
      // We need to resolve accounts for the first instruction to capture "before" state of interest
      // This is a bit tricky with multiple instructions. 
      // Strategy: Collect ALL unique accounts across all instructions.
      
      const allLabels = new Map<string, PublicKey>();
      
      // 1. Resolve all accounts for all instructions
      for (const inst of transaction.instructions) {
        const resolved = await this.resolveTransactionAccounts(inst, programId, payer);
        resolved.labels.forEach((l) => allLabels.set(l.label, l.address));
      }

      const labels = Array.from(allLabels.entries()).map(([label, address]) => ({ label, address }));
      const before = await stateCapture.captureMultipleAccounts(labels);

      // 2. Execute instructions sequentially
      for (const inst of transaction.instructions) {
         const resolved = await this.resolveTransactionAccounts(inst, programId, payer);
         await this.invoke(program, inst.instructionName, inst.args || [], resolved);
      }

      return { before, resolved: { accounts: {}, signers: [], labels } }; 
    });
  }

  private async executeCommon(
    template: Template, 
    scenarioName: string,
    executionLogic: (
      program: any, 
      programId: PublicKey, 
      payer: Keypair,
      stateCapture: StateCapture
    ) => Promise<{ before: any[], resolved: ResolvedAccounts }>
  ): Promise<ExecutionResult> {
    this.accountCache.clear();
    this.signerCache.clear();
    this.lastLogs = null;
    this.lastComputeUnits = null;

    if (!SUPPORTED_TEMPLATES.has(template.id)) {
      return this.fail(
        scenarioName,
        `Live execution is not yet supported for "${template.id}".`
      );
    }

    let workspaceDir: string | null = null;

    try {
      await this.ensureValidator();
      const connection = this.getConnection();
      const payer = await this.getPayer(connection);

      workspaceDir = await this.workspaceManager.create(template.id);
      const compiler = new ProgramCompiler();
      const compileResult = await compiler.compile(
        template.id,
        template.code,
        workspaceDir
      );

      if (!compileResult.success) {
        return this.fail(scenarioName, `Compilation failed: ${compileResult.error}`);
      }

      if (!compileResult.programKeypairPath) {
        return this.fail(scenarioName, "Program keypair not found after build.");
      }

      const payerKeypairPath = await this.writePayerKeypair(payer, workspaceDir);
      await this.deployProgram(
        compileResult.programPath,
        compileResult.programKeypairPath,
        payerKeypairPath
      );

      const programId = new PublicKey(compileResult.programId);
      const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(payer),
        { commitment: "confirmed" }
      );

      const idlPath = compileResult.idlPath;
      if (!idlPath) {
        return this.fail(scenarioName, "IDL not found after compilation.");
      }
      const idl = await this.loadIdl(idlPath);
      const program = new anchor.Program(idl, programId, provider);
      const stateCapture = new StateCapture(connection);

      // Run valid execution logic
      const { before, resolved } = await executionLogic(program, programId, payer, stateCapture);

      // Capture after state
      const after = await stateCapture.captureMultipleAccounts(resolved.labels);
      const diff = stateCapture.computeStateDiff(before, after);

      const accountsAfter = after.map((account) => {
        const change = diff.find((c) => c.address === account.address);
        return { ...account, changes: change?.changes ?? [] };
      });

      return {
        success: true,
        scenario: scenarioName,
        accountsBefore: before,
        accountsAfter,
        logs: this.lastLogs ?? [],
        computeUnits: this.lastComputeUnits ?? 0,
        trace: parseTransactionLogs(this.lastLogs ?? []),
      };
    } catch (error) {
      return this.fail(scenarioName, error instanceof Error ? error.message : String(error));
    } finally {
      if (workspaceDir) {
        await this.workspaceManager.cleanup(workspaceDir);
      }
    }
  }

  private lastLogs: string[] | null = null;
  private lastComputeUnits: number | null = null;

  private async executeWithPrerequisites(
    program: any,
    input: ExecutionScenarioInput,
    programId: PublicKey,
    payer: Keypair
  ): Promise<void> {
    const instruction = input.instruction;

    if (input.template.id === "pda-vault" && (instruction === "deposit" || instruction === "withdraw")) {
      const initAccounts = await this.resolveAccounts(input.template, "initialize", programId, payer);
      await this.invoke(program, "initialize", [], initAccounts);
    }

    if (input.template.id === "account-init" && instruction === "update") {
      const initAccounts = await this.resolveAccounts(input.template, "initialize", programId, payer);
      await this.invoke(program, "initialize", [42], initAccounts);
    }

    const resolved = await this.resolveAccounts(input.template, instruction, programId, payer);
    await this.invoke(program, instruction, input.args, resolved);
  }

  private async invoke(
    program: any,
    instruction: string,
    args: unknown[],
    resolved: ResolvedAccounts
  ): Promise<void> {
    if (!(instruction in program.methods)) {
      throw new Error(`Instruction "${instruction}" not found in IDL`);
    }

    const method = (program.methods as Record<string, (...args: unknown[]) => any>)[
      instruction
    ];
    if (!method) {
      throw new Error(`Instruction "${instruction}" not found in program methods.`);
    }

    const signature = await method(...args)
      .accounts(resolved.accounts)
      .signers(resolved.signers)
      .rpc();

    const connection = this.getConnection();
    const tx = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    this.lastLogs = tx?.meta?.logMessages ?? [];
    this.lastComputeUnits = tx?.meta?.computeUnitsConsumed ?? 0;
  }

  private async resolveAccounts(
    template: Template,
    instruction: string,
    programId: PublicKey,
    payer: Keypair
  ): Promise<ResolvedAccounts> {
    const instructionMeta = template.programMap.instructions.find((i) => i.name === instruction);
    if (!instructionMeta) {
      throw new Error(`Instruction "${instruction}" not found in program map.`);
    }

    const accounts: Record<string, PublicKey> = {};
    const signers: Keypair[] = [];
    const labels: Array<{ address: PublicKey; label: string }> = [];

    const payerPubkey = payer.publicKey;

    for (const acc of instructionMeta.accounts) {
      if (acc.name === "system_program") {
        accounts[acc.name] = SystemProgram.programId;
        labels.push({ address: SystemProgram.programId, label: "System Program" });
        continue;
      }

      if (acc.isPda) {
        const derived = await this.derivePda(acc.seeds ?? [], payerPubkey, programId);
        accounts[acc.name] = derived;
        labels.push({ address: derived, label: acc.name });
        continue;
      }

      if (acc.name === "user" || acc.name === "authority" || acc.name === "payer") {
        accounts[acc.name] = payerPubkey;
        labels.push({ address: payerPubkey, label: acc.name });
        continue;
      }

      if (this.accountCache.has(acc.name)) {
        const cached = this.accountCache.get(acc.name)!;
        accounts[acc.name] = cached;
        labels.push({ address: cached, label: acc.name });
        const signer = this.signerCache.get(acc.name);
        if (signer) {
          signers.push(signer);
        }
        continue;
      }

      if (acc.name === "my_account") {
        const keypair = Keypair.generate();
        this.accountCache.set(acc.name, keypair.publicKey);
        this.signerCache.set(acc.name, keypair);
        accounts[acc.name] = keypair.publicKey;
        labels.push({ address: keypair.publicKey, label: "My Account" });
        signers.push(keypair);
        continue;
      }

      throw new Error(`Account "${acc.name}" is not supported in live execution yet.`);
    }

    if (!signers.includes(payer)) {
      signers.unshift(payer);
    }

    return { accounts, signers, labels };
  }

  private async derivePda(
    seeds: string[],
    payerPubkey: PublicKey,
    programId: PublicKey
  ): Promise<PublicKey> {
    if (seeds.length === 0) {
      throw new Error("PDA seeds are required but missing.");
    }

    const buffers = seeds.map((seed) => {
      if (seed === "authority.key()" || seed === "user.key()" || seed === "payer.key()") {
        return payerPubkey.toBuffer();
      }
      return Buffer.from(seed, "utf8");
    });

    const [pda] = PublicKey.findProgramAddressSync(buffers, programId);
    return pda;
  }

  private async ensureValidator(): Promise<void> {
    if (!this.validatorManager) {
      const port = parseInt(process.env.VALIDATOR_PORT || "8899", 10);
      this.validatorManager = new ValidatorManager(port, port);
    }
    if (!this.validatorManager.isRunning()) {
      await this.validatorManager.start();
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  private getConnection(): Connection {
    if (!this.connection) {
      if (!this.validatorManager) {
        throw new Error("Validator is not initialized");
      }
      this.connection = new Connection(this.validatorManager.getRpcUrl(), "confirmed");
    }
    return this.connection;
  }

  private async getPayer(connection: Connection): Promise<Keypair> {
    if (!this.payer) {
      this.payer = Keypair.generate();
      const sig = await connection.requestAirdrop(this.payer.publicKey, 2_000_000_000);
      await connection.confirmTransaction(sig, "confirmed");
    }
    return this.payer;
  }

  private async deployProgram(
    programPath: string,
    programKeypairPath: string,
    payerKeypairPath: string
  ): Promise<void> {
    const cmd = "solana";
    const args = [
      "program",
      "deploy",
      programPath,
      "--program-id",
      programKeypairPath,
      "--keypair",
      payerKeypairPath,
      "--url",
      this.validatorManager?.getRpcUrl() || "http://localhost:8899",
    ];
    await execFileAsync(cmd, args, { env: process.env });
  }

  private async writePayerKeypair(payer: Keypair, workspaceDir: string): Promise<string> {
    const { writeFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");
    const dir = join(workspaceDir, "keys");
    await mkdir(dir, { recursive: true });
    const keypairPath = join(dir, "payer.json");
    await writeFile(keypairPath, JSON.stringify(Array.from(payer.secretKey)));
    return keypairPath;
  }

  private async loadIdl(idlPath: string): Promise<any> {
    const { readFile } = await import("fs/promises");
    const content = await readFile(idlPath, "utf-8");
    return JSON.parse(content);
  }

  private fail(input: ExecutionScenarioInput, message: string): ExecutionResult {
    return {
      success: false,
      scenario: input.scenarioName,
      accountsBefore: [],
      accountsAfter: [],
      logs: [],
      computeUnits: 0,
      trace: [],
      error: message,
    };
  }

  private unsupported(input: ExecutionScenarioInput, message: string): ExecutionResult {
    return this.fail(input, message);
  }
}
