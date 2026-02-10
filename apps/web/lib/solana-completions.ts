"use client";

import type * as Monaco from "monaco-editor";

// ─── Solana SDK Types & Constants ────────────────────────────────────────

interface CompletionEntry {
  label: string;
  insertText: string;
  detail: string;
  documentation?: string;
  kind: "keyword" | "macro" | "type" | "snippet" | "field" | "function" | "constant" | "constraint";
}

const SOLANA_KEYWORDS: CompletionEntry[] = [
  { label: "msg!", insertText: 'msg!("${1:message}");', detail: "Log a message to program output", kind: "keyword" },
  { label: "require!", insertText: 'require!(${1:condition}, ${2:ErrorCode});', detail: "Assert condition or return error", kind: "keyword" },
  { label: "emit!", insertText: "emit!(${1:EventName} {\n    ${2:field}: ${3:value},\n});", detail: "Emit an Anchor event", kind: "keyword" },
  { label: "error!", insertText: "error!(${1:ErrorCode})", detail: "Return an Anchor error", kind: "keyword" },
  { label: "err!", insertText: "err!(${1:ErrorCode})", detail: "Create an Anchor error", kind: "keyword" },
  { label: "invoke", insertText: "invoke(\n    &${1:instruction},\n    &[${2:accounts}],\n)?;", detail: "Cross-program invocation", kind: "function" },
  { label: "invoke_signed", insertText: "invoke_signed(\n    &${1:instruction},\n    &[${2:accounts}],\n    &[&[${3:seeds}, &[${4:bump}]]],\n)?;", detail: "CPI with PDA signer", kind: "function" },
  { label: "solana_program::pubkey!", insertText: 'solana_program::pubkey!("${1:address}")', detail: "Create Pubkey from string literal", kind: "keyword" },
];

const ANCHOR_MACROS: CompletionEntry[] = [
  { label: "#[program]", insertText: "#[program]\npub mod ${1:program_name} {\n    use super::*;\n\n    pub fn ${2:initialize}(ctx: Context<${3:Initialize}>) -> Result<()> {\n        ${0}\n        Ok(())\n    }\n}", detail: "Anchor program module", kind: "macro" },
  { label: "#[account]", insertText: "#[account]\npub struct ${1:AccountName} {\n    pub ${2:field}: ${3:u64},\n}", detail: "Anchor account struct", kind: "macro" },
  { label: "#[derive(Accounts)]", insertText: "#[derive(Accounts)]\npub struct ${1:InstructionName}<'info> {\n    ${0}\n}", detail: "Anchor accounts context", kind: "macro" },
  { label: "#[instruction]", insertText: "#[instruction(${1:arg}: ${2:u64})]", detail: "Anchor instruction args", kind: "macro" },
  { label: "#[error_code]", insertText: "#[error_code]\npub enum ${1:ErrorCode} {\n    #[msg(\"${2:Error message}\")]\n    ${3:ErrorVariant},\n}", detail: "Anchor error enum", kind: "macro" },
  { label: "#[event]", insertText: "#[event]\npub struct ${1:EventName} {\n    pub ${2:field}: ${3:u64},\n}", detail: "Anchor event struct", kind: "macro" },
  { label: "#[constant]", insertText: "#[constant]\npub const ${1:NAME}: ${2:u64} = ${3:value};", detail: "Anchor constant", kind: "macro" },
  { label: "#[access_control]", insertText: "#[access_control(${1:check_fn}(${2:&ctx}))]", detail: "Anchor access control", kind: "macro" },
];

const SOLANA_TYPES: CompletionEntry[] = [
  { label: "Pubkey", insertText: "Pubkey", detail: "Solana public key (32 bytes)", kind: "type" },
  { label: "AccountInfo", insertText: "AccountInfo<'info>", detail: "Raw Solana account info", kind: "type" },
  { label: "ProgramError", insertText: "ProgramError", detail: "Solana program error enum", kind: "type" },
  { label: "Instruction", insertText: "Instruction", detail: "Solana instruction", kind: "type" },
  { label: "SystemProgram", insertText: "SystemProgram", detail: "Solana system program (raw SDK)", kind: "type" },
  { label: "Rent", insertText: "Rent", detail: "Rent sysvar", kind: "type" },
  { label: "Clock", insertText: "Clock", detail: "Clock sysvar", kind: "type" },
  { label: "EpochSchedule", insertText: "EpochSchedule", detail: "Epoch schedule sysvar", kind: "type" },
];

const ANCHOR_ACCOUNT_TYPES: CompletionEntry[] = [
  { label: "Account", insertText: "Account<'info, ${1:T}>", detail: "Deserialized Anchor account", kind: "type" },
  { label: "Signer", insertText: "Signer<'info>", detail: "Validated signer account", kind: "type" },
  { label: "SystemAccount", insertText: "SystemAccount<'info>", detail: "System-owned account", kind: "type" },
  { label: "Program", insertText: "Program<'info, ${1:System}>", detail: "Validated program account", kind: "type" },
  { label: "UncheckedAccount", insertText: "/// CHECK: ${1:Reason}\n    UncheckedAccount<'info>", detail: "Unchecked account (requires doc comment)", kind: "type" },
  { label: "AccountLoader", insertText: "AccountLoader<'info, ${1:T}>", detail: "Zero-copy account loader", kind: "type" },
  { label: "Box<Account>", insertText: "Box<Account<'info, ${1:T}>>", detail: "Heap-allocated account (for large accounts)", kind: "type" },
  { label: "InterfaceAccount", insertText: "InterfaceAccount<'info, ${1:TokenAccount}>", detail: "SPL interface account", kind: "type" },
  { label: "Interface", insertText: "Interface<'info, ${1:TokenInterface}>", detail: "SPL program interface", kind: "type" },
];

const ANCHOR_CONSTRAINTS: CompletionEntry[] = [
  { label: "init", insertText: "init, payer = ${1:payer}, space = ${2:8 + size}", detail: "Initialize new account", kind: "constraint" },
  { label: "mut", insertText: "mut", detail: "Mutable account", kind: "constraint" },
  { label: "has_one", insertText: "has_one = ${1:field}", detail: "Validate field matches account", kind: "constraint" },
  { label: "seeds", insertText: "seeds = [${1:b\"seed\"}], bump", detail: "PDA seeds + bump", kind: "constraint" },
  { label: "seeds with bump", insertText: "seeds = [${1:b\"seed\"}, ${2:key}.as_ref()], bump = ${3:account}.bump", detail: "PDA with stored bump", kind: "constraint" },
  { label: "constraint", insertText: 'constraint = ${1:condition} @ ${2:ErrorCode}', detail: "Custom constraint with error", kind: "constraint" },
  { label: "close", insertText: "close = ${1:destination}", detail: "Close account, send lamports", kind: "constraint" },
  { label: "realloc", insertText: "realloc = ${1:new_size}, realloc::payer = ${2:payer}, realloc::zero = ${3:false}", detail: "Resize account data", kind: "constraint" },
  { label: "token::mint", insertText: "token::mint = ${1:mint}, token::authority = ${2:authority}", detail: "Token account constraints", kind: "constraint" },
  { label: "associated_token::mint", insertText: "associated_token::mint = ${1:mint}, associated_token::authority = ${2:authority}", detail: "ATA constraints", kind: "constraint" },
  { label: "address", insertText: "address = ${1:EXPECTED_PUBKEY}", detail: "Validate account address", kind: "constraint" },
  { label: "owner", insertText: "owner = ${1:program_id}", detail: "Validate account owner", kind: "constraint" },
  { label: "rent_exempt", insertText: 'rent_exempt = ${1:enforce}', detail: "Rent exemption check", kind: "constraint" },
];

const COMMON_SNIPPETS: CompletionEntry[] = [
  {
    label: "anchor_instruction",
    insertText: "pub fn ${1:instruction_name}(ctx: Context<${2:InstructionAccounts}>${3:, ${4:arg}: ${5:u64}}) -> Result<()> {\n    ${0}\n    Ok(())\n}",
    detail: "New Anchor instruction",
    documentation: "Creates a new instruction handler function",
    kind: "snippet",
  },
  {
    label: "transfer_sol",
    insertText: "let cpi_context = CpiContext::new(\n    ctx.accounts.system_program.to_account_info(),\n    system_program::Transfer {\n        from: ctx.accounts.${1:from}.to_account_info(),\n        to: ctx.accounts.${2:to}.to_account_info(),\n    },\n);\nsystem_program::transfer(cpi_context, ${3:amount})?;",
    detail: "Transfer SOL via system program CPI",
    kind: "snippet",
  },
  {
    label: "transfer_sol_pda",
    insertText: "let seeds = &[${1:b\"seed\"}, &[ctx.bumps.${2:pda}]];\nlet signer_seeds = &[&seeds[..]];\nlet cpi_context = CpiContext::new_with_signer(\n    ctx.accounts.system_program.to_account_info(),\n    system_program::Transfer {\n        from: ctx.accounts.${3:pda}.to_account_info(),\n        to: ctx.accounts.${4:destination}.to_account_info(),\n    },\n    signer_seeds,\n);\nsystem_program::transfer(cpi_context, ${5:amount})?;",
    detail: "Transfer SOL from PDA via signed CPI",
    kind: "snippet",
  },
  {
    label: "transfer_token",
    insertText: "let cpi_accounts = Transfer {\n    from: ctx.accounts.${1:from_ata}.to_account_info(),\n    to: ctx.accounts.${2:to_ata}.to_account_info(),\n    authority: ctx.accounts.${3:authority}.to_account_info(),\n};\nlet cpi_program = ctx.accounts.token_program.to_account_info();\ntoken::transfer(CpiContext::new(cpi_program, cpi_accounts), ${4:amount})?;",
    detail: "Transfer SPL tokens via CPI",
    kind: "snippet",
  },
  {
    label: "mint_to",
    insertText: "let cpi_accounts = MintTo {\n    mint: ctx.accounts.${1:mint}.to_account_info(),\n    to: ctx.accounts.${2:token_account}.to_account_info(),\n    authority: ctx.accounts.${3:authority}.to_account_info(),\n};\ntoken::mint_to(CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts), ${4:amount})?;",
    detail: "Mint SPL tokens",
    kind: "snippet",
  },
  {
    label: "accounts_struct",
    insertText: "#[derive(Accounts)]\npub struct ${1:InstructionName}<'info> {\n    #[account(mut)]\n    pub ${2:payer}: Signer<'info>,\n    #[account(\n        init,\n        payer = ${2:payer},\n        space = 8 + ${3:DataAccount}::INIT_SPACE,\n    )]\n    pub ${4:data_account}: Account<'info, ${3:DataAccount}>,\n    pub system_program: Program<'info, System>,\n}",
    detail: "Full accounts context struct with init",
    kind: "snippet",
  },
  {
    label: "pda_account",
    insertText: "#[account(\n    init,\n    payer = ${1:payer},\n    space = 8 + ${2:DataAccount}::INIT_SPACE,\n    seeds = [${3:b\"seed\"}, ${4:authority}.key().as_ref()],\n    bump,\n)]\npub ${5:pda}: Account<'info, ${2:DataAccount}>,",
    detail: "PDA account with seeds",
    kind: "snippet",
  },
  {
    label: "error_enum",
    insertText: "#[error_code]\npub enum ${1:ErrorCode} {\n    #[msg(\"${2:Unauthorized access}\")]\n    ${3:Unauthorized},\n    #[msg(\"${4:Invalid input}\")]\n    ${5:InvalidInput},\n}",
    detail: "Anchor error code enum",
    kind: "snippet",
  },
  {
    label: "event_struct",
    insertText: "#[event]\npub struct ${1:EventName} {\n    pub ${2:user}: Pubkey,\n    pub ${3:amount}: u64,\n    pub ${4:timestamp}: i64,\n}",
    detail: "Anchor event struct",
    kind: "snippet",
  },
  {
    label: "init_space",
    insertText: "#[account]\n#[derive(InitSpace)]\npub struct ${1:DataAccount} {\n    pub authority: Pubkey,     // 32\n    pub ${2:value}: u64,          // 8\n    pub bump: u8,              // 1\n}",
    detail: "Account struct with InitSpace derive",
    kind: "snippet",
  },
];

// ─── Context-Aware Helpers ───────────────────────────────────────────────

/**
 * Parse #[derive(Accounts)] structs and extract field names with types
 */
function extractAccountFields(code: string): Array<{ name: string; type: string }> {
  const fields: Array<{ name: string; type: string }> = [];

  // Match #[derive(Accounts)] struct bodies
  // Handles multi-line attributes before fields
  const structRegex = /#\[derive\(Accounts\)\]\s*(?:#\[.*?\]\s*)*pub\s+struct\s+\w+[^{]*\{([\s\S]*?)\}/g;

  let structMatch: RegExpExecArray | null;
  while ((structMatch = structRegex.exec(code)) !== null) {
    const body = structMatch[1];
    if (!body) continue;
    // Match pub field_name: Type<...>
    const fieldRegex = /pub\s+(\w+)\s*:\s*([^,\n]+)/g;
    let fieldMatch: RegExpExecArray | null;
    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const name = fieldMatch[1];
      const type = fieldMatch[2];
      if (name && type) {
        fields.push({ name, type: type.trim() });
      }
    }
  }

  return fields;
}

/**
 * Parse #[account] structs and extract their field names
 */
function extractDataAccountFields(code: string): Array<{ name: string; type: string }> {
  const fields: Array<{ name: string; type: string }> = [];

  // Match #[account] struct bodies (NOT #[derive(Accounts)])
  const structRegex = /#\[account\]\s*(?:#\[.*?\]\s*)*pub\s+struct\s+(\w+)[^{]*\{([\s\S]*?)\}/g;

  let structMatch: RegExpExecArray | null;
  while ((structMatch = structRegex.exec(code)) !== null) {
    const body = structMatch[2];
    if (!body) continue;
    const fieldRegex = /pub\s+(\w+)\s*:\s*([^,\n]+)/g;
    let fieldMatch: RegExpExecArray | null;
    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const name = fieldMatch[1];
      const type = fieldMatch[2];
      if (name && type) {
        fields.push({ name, type: type.trim() });
      }
    }
  }

  return fields;
}

/**
 * Determine context from text before cursor to provide smart suggestions
 */
function getCompletionContext(
  textBeforeCursor: string
): "ctx_accounts" | "constraint" | "account_field" | "general" {
  const trimmed = textBeforeCursor.trimEnd();

  // After ctx.accounts. — suggest account names
  if (/ctx\.accounts\.\s*$/.test(trimmed) || /ctx\.accounts\.[\w]*$/.test(trimmed)) {
    return "ctx_accounts";
  }

  // Inside #[account(...)] — suggest constraints
  if (/#\[account\([^)]*$/.test(trimmed)) {
    return "constraint";
  }

  // After a dot on an account-like variable — suggest data fields
  if (/ctx\.accounts\.\w+\.\s*$/.test(trimmed) || /ctx\.accounts\.\w+\.[\w]*$/.test(trimmed)) {
    return "account_field";
  }

  return "general";
}

// ─── Completion Item Builder ─────────────────────────────────────────────

function getMonacoKind(
  monaco: typeof Monaco,
  kind: CompletionEntry["kind"]
): Monaco.languages.CompletionItemKind {
  switch (kind) {
    case "keyword": return monaco.languages.CompletionItemKind.Keyword;
    case "macro": return monaco.languages.CompletionItemKind.Snippet;
    case "type": return monaco.languages.CompletionItemKind.Class;
    case "snippet": return monaco.languages.CompletionItemKind.Snippet;
    case "field": return monaco.languages.CompletionItemKind.Field;
    case "function": return monaco.languages.CompletionItemKind.Function;
    case "constant": return monaco.languages.CompletionItemKind.Constant;
    case "constraint": return monaco.languages.CompletionItemKind.Property;
    default: return monaco.languages.CompletionItemKind.Text;
  }
}

function toCompletionItem(
  monaco: typeof Monaco,
  entry: CompletionEntry,
  range: Monaco.IRange
): Monaco.languages.CompletionItem {
  return {
    label: entry.label,
    kind: getMonacoKind(monaco, entry.kind),
    insertText: entry.insertText,
    insertTextRules: entry.insertText.includes("${")
      ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      : undefined,
    range,
    detail: entry.detail,
    documentation: entry.documentation
      ? { value: entry.documentation, isTrusted: true }
      : undefined,
    sortText: entry.kind === "snippet" ? "1" : "0", // snippets sort after keywords
  };
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Create and register the Solana/Anchor completion provider on Monaco.
 * Returns a disposable to clean up the provider.
 */
export function registerSolanaCompletionProvider(
  monaco: typeof Monaco
): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("rust", {
    triggerCharacters: [".", ":", "#", "(", " "],

    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range: Monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const textBeforeCursor = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const fullCode = model.getValue();
      const context = getCompletionContext(textBeforeCursor);

      // ── Context: ctx.accounts. → suggest account field names ──
      if (context === "ctx_accounts") {
        const fields = extractAccountFields(fullCode);
        if (fields.length > 0) {
          return {
            suggestions: fields.map((field) => ({
              label: field.name,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: field.name,
              range,
              detail: field.type,
              documentation: `Account field: ${field.name}: ${field.type}`,
              sortText: "0",
            })),
          };
        }
      }

      // ── Context: #[account(...)] → suggest constraints ──
      if (context === "constraint") {
        return {
          suggestions: ANCHOR_CONSTRAINTS.map((c) => toCompletionItem(monaco, c, range)),
        };
      }

      // ── Context: ctx.accounts.xyz. → suggest data fields ──
      if (context === "account_field") {
        const dataFields = extractDataAccountFields(fullCode);
        const common = [
          { name: "key()", type: "Pubkey", doc: "Get account public key" },
          { name: "to_account_info()", type: "AccountInfo", doc: "Convert to AccountInfo" },
          { name: "lamports()", type: "u64", doc: "Get account lamports" },
        ];
        return {
          suggestions: [
            ...common.map((f) => ({
              label: f.name,
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: f.name,
              range,
              detail: `→ ${f.type}`,
              documentation: f.doc,
              sortText: "0",
            })),
            ...dataFields.map((field) => ({
              label: field.name,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: field.name,
              range,
              detail: field.type,
              sortText: "1",
            })),
          ],
        };
      }

      // ── General: return all Solana/Anchor completions ──
      const allEntries: CompletionEntry[] = [
        ...SOLANA_KEYWORDS,
        ...ANCHOR_MACROS,
        ...SOLANA_TYPES,
        ...ANCHOR_ACCOUNT_TYPES,
        ...COMMON_SNIPPETS,
      ];

      return {
        suggestions: allEntries.map((entry) => toCompletionItem(monaco, entry, range)),
      };
    },
  });
}
