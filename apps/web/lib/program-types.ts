import type { ProgramMap, FunctionSpec, PrecomputedState, TemplateMetadata } from "@solana-playground/types";

export type ProgramTypeId =
  | "hello-solana"
  | "token-mint"
  | "nft-mint"
  | "pda-vault"
  | "escrow"
  | "custom";

export interface ProgramTypeDefinition {
  id: ProgramTypeId;
  label: string;
  description: string;
  scaffold: string;
  metadata: Omit<TemplateMetadata, "id">;
  functionSpecs: FunctionSpec[];
  programMap: ProgramMap;
  precomputedState: PrecomputedState;
  checklist: string[];
}

const emptyProgramMap: ProgramMap = {
  flow: [],
  instructions: [],
  accounts: [],
  cpiCalls: [],
};

const emptyPrecomputed: PrecomputedState = { scenarios: [] };

export const PROGRAM_TYPES: ProgramTypeDefinition[] = [
  {
    id: "hello-solana",
    label: "Hello Solana",
    description: "The simplest Anchor program to get started.",
    scaffold: `use anchor_lang::prelude::*;\n\ndeclare_id!(\"ReplaceWithYourProgramId11111111111111111111\");\n\n#[program]\npub mod hello_solana {\n    use super::*;\n\n    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {\n        // TODO: emit a log or initialize state\n        Ok(())\n    }\n}\n\n#[derive(Accounts)]\npub struct Initialize {}\n`,
    metadata: {
      name: "Hello Solana",
      description: "Bootstrap an Anchor program and run your first instruction.",
      difficulty: "beginner",
      learningGoals: ["Understand basic Anchor program structure"],
      solanaConcepts: ["Programs", "Instructions"],
      estimatedTime: "10 minutes",
      prerequisites: [],
    },
    functionSpecs: [
      {
        id: "initialize",
        title: "initialize",
        lineRange: [7, 12],
        does: "Defines the first instruction in the program.",
        why: "Every Anchor program starts with an entry instruction.",
        breaksIfRemoved: "The program has no callable entrypoint.",
        concepts: ["Instructions", "Programs"],
      },
    ],
    programMap: emptyProgramMap,
    precomputedState: emptyPrecomputed,
    checklist: ["Instruction implemented", "Program builds"],
  },
  {
    id: "token-mint",
    label: "Token Mint",
    description: "Create a mint and mint tokens.",
    scaffold: `use anchor_lang::prelude::*;\nuse anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, SetAuthority};\n\ndeclare_id!(\"ReplaceWithYourProgramId11111111111111111111\");\n\n#[program]\npub mod token_mint {\n    use super::*;\n\n    pub fn initialize_mint(_ctx: Context<InitializeMint>, _decimals: u8) -> Result<()> {\n        // TODO: initialize mint with authority\n        Ok(())\n    }\n\n    pub fn mint_tokens(_ctx: Context<MintTokens>, _amount: u64) -> Result<()> {\n        // TODO: mint tokens to an ATA\n        Ok(())\n    }\n\n    pub fn set_authority(_ctx: Context<SetAuthorityCtx>) -> Result<()> {\n        // TODO: rotate mint authority safely\n        Ok(())\n    }\n}\n\n#[derive(Accounts)]\npub struct InitializeMint {\n    // TODO: define mint + payer + system accounts\n}\n\n#[derive(Accounts)]\npub struct MintTokens {\n    // TODO: define mint, token account, authority\n}\n\n#[derive(Accounts)]\npub struct SetAuthorityCtx {\n    // TODO: define mint + current authority\n}\n`,
    metadata: {
      name: "Token Mint",
      description: "Mint SPL tokens and manage authorities.",
      difficulty: "intermediate",
      learningGoals: ["Understand token program flows"],
      solanaConcepts: ["SPL Token", "Authority", "ATAs"],
      estimatedTime: "30 minutes",
      prerequisites: ["Hello Solana"],
    },
    functionSpecs: [
      {
        id: "initialize_mint",
        title: "initialize_mint",
        lineRange: [9, 14],
        does: "Initializes the mint with a given authority.",
        why: "Token mints must be initialized before minting.",
        breaksIfRemoved: "No mint exists to issue tokens.",
        concepts: ["Mint", "Authority"],
      },
      {
        id: "mint_tokens",
        title: "mint_tokens",
        lineRange: [16, 21],
        does: "Mints tokens into an associated token account.",
        why: "Token supply changes only through authorized minting.",
        breaksIfRemoved: "Cannot issue tokens.",
        concepts: ["Mint", "ATA"],
      },
    ],
    programMap: emptyProgramMap,
    precomputedState: emptyPrecomputed,
    checklist: ["Mint initialized", "Mint authority validated", "Tokens minted"],
  },
  {
    id: "nft-mint",
    label: "NFT Mint",
    description: "Mint a single-supply token with metadata.",
    scaffold: `use anchor_lang::prelude::*;\n\ndeclare_id!(\"ReplaceWithYourProgramId11111111111111111111\");\n\n#[program]\npub mod nft_mint {\n    use super::*;\n\n    pub fn create_nft(_ctx: Context<CreateNft>) -> Result<()> {\n        // TODO: mint NFT + metadata\n        Ok(())\n    }\n}\n\n#[derive(Accounts)]\npub struct CreateNft {\n    // TODO: define mint, metadata, payer, authority\n}\n`,
    metadata: {
      name: "NFT Mint",
      description: "Mint an NFT with metadata on Solana.",
      difficulty: "intermediate",
      learningGoals: ["Understand NFT minting basics"],
      solanaConcepts: ["NFT", "Metadata"],
      estimatedTime: "40 minutes",
      prerequisites: ["Token Mint"],
    },
    functionSpecs: [],
    programMap: emptyProgramMap,
    precomputedState: emptyPrecomputed,
    checklist: ["NFT minted", "Metadata created"],
  },
  {
    id: "pda-vault",
    label: "PDA Vault",
    description: "Derive a PDA and hold lamports.",
    scaffold: `use anchor_lang::prelude::*;\n\ndeclare_id!(\"ReplaceWithYourProgramId11111111111111111111\");\n\n#[program]\npub mod pda_vault {\n    use super::*;\n\n    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {\n        // TODO: derive PDA + initialize vault\n        Ok(())\n    }\n\n    pub fn deposit(_ctx: Context<Deposit>, _amount: u64) -> Result<()> {\n        // TODO: transfer lamports into vault\n        Ok(())\n    }\n\n    pub fn withdraw(_ctx: Context<Withdraw>, _amount: u64) -> Result<()> {\n        // TODO: validate authority + withdraw
        Ok(())\n    }\n}\n\n#[derive(Accounts)]\npub struct Initialize {\n    // TODO: define PDA vault + payer\n}\n\n#[derive(Accounts)]\npub struct Deposit {\n    // TODO: define vault + depositor\n}\n\n#[derive(Accounts)]\npub struct Withdraw {\n    // TODO: define vault + authority\n}\n`,
    metadata: {
      name: "PDA Vault",
      description: "Learn PDA derivation and authority.",
      difficulty: "intermediate",
      learningGoals: ["Derive PDAs", "Guard authority"],
      solanaConcepts: ["PDA", "Authority"],
      estimatedTime: "30 minutes",
      prerequisites: ["Hello Solana"],
    },
    functionSpecs: [],
    programMap: emptyProgramMap,
    precomputedState: emptyPrecomputed,
    checklist: ["Vault initialized", "Deposit works", "Withdraw guarded"],
  },
  {
    id: "escrow",
    label: "Escrow",
    description: "Create a simple escrow contract.",
    scaffold: `use anchor_lang::prelude::*;\n\ndeclare_id!(\"ReplaceWithYourProgramId11111111111111111111\");\n\n#[program]\npub mod escrow {\n    use super::*;\n\n    pub fn create_escrow(_ctx: Context<CreateEscrow>, _amount: u64) -> Result<()> {\n        // TODO: initialize escrow
        Ok(())\n    }\n\n    pub fn fulfill(_ctx: Context<Fulfill>) -> Result<()> {\n        // TODO: release assets\n        Ok(())\n    }\n}\n\n#[derive(Accounts)]\npub struct CreateEscrow {\n    // TODO: define escrow accounts\n}\n\n#[derive(Accounts)]\npub struct Fulfill {\n    // TODO: define buyer + seller + escrow\n}\n`,
    metadata: {
      name: "Escrow",
      description: "Safely exchange assets between parties.",
      difficulty: "intermediate",
      learningGoals: ["Understand escrow pattern"],
      solanaConcepts: ["Escrow", "Authority"],
      estimatedTime: "45 minutes",
      prerequisites: ["Token Mint"],
    },
    functionSpecs: [],
    programMap: emptyProgramMap,
    precomputedState: emptyPrecomputed,
    checklist: ["Escrow created", "Fulfill succeeds"],
  },
  {
    id: "custom",
    label: "Custom",
    description: "Start from a blank Anchor program.",
    scaffold: `use anchor_lang::prelude::*;\n\ndeclare_id!(\"ReplaceWithYourProgramId11111111111111111111\");\n\n#[program]\npub mod custom_program {\n    use super::*;\n\n    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {\n        // TODO: implement your instruction\n        Ok(())\n    }\n}\n\n#[derive(Accounts)]\npub struct Initialize {}\n`,
    metadata: {
      name: "Custom Program",
      description: "Bring your own idea and build from scratch.",
      difficulty: "intermediate",
      learningGoals: ["Design a custom program"],
      solanaConcepts: ["Programs"],
      estimatedTime: "60 minutes",
      prerequisites: [],
    },
    functionSpecs: [],
    programMap: emptyProgramMap,
    precomputedState: emptyPrecomputed,
    checklist: ["Program builds"],
  },
];

export const PROGRAM_TYPE_MAP = new Map(PROGRAM_TYPES.map((type) => [type.id, type]));
