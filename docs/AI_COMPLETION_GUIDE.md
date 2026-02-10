# AI Code Completion Guide

## How AI Completion Works in Solana Playground

### Overview

The AI completion feature uses **Google Gemini 1.5 Flash** to provide intelligent code suggestions as you type. It's specifically trained to understand Solana/Anchor patterns and helps you write correct Solana programs.

---

## When Does AI Completion Work?

### ✅ **Works In:**

1. **Existing Templates**
   - When editing any template (hello-solana, token-mint, etc.)
   - AI understands the context of the template

2. **New Custom Programs**
   - When you create a new program via "New Program" button
   - AI helps you write code from scratch
   - Works immediately after program creation

3. **Any Code Editor**
   - Works in the main code editor
   - Provides suggestions as you type

### ❌ **Doesn't Work:**

- In comments (by design)
- In string literals (by design)
- When GEMINI_API_KEY is not set (silently fails)

---

## How It Works

### 1. **Trigger Mechanism**

AI completion is **automatic** - it appears as "ghost text" (gray suggestions) as you type:

```
You type: pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    [Ghost text appears suggesting:]
    let cpi_context = CpiContext::new(...)
```

### 2. **Context Awareness**

The AI receives:
- **Prefix**: All code before your cursor
- **Suffix**: All code after your cursor

This gives it full context of:
- What you're trying to write
- What comes before and after
- The structure of your program

### 3. **Solana-Specific Prompting**

The AI is instructed to:
- ✅ Only suggest valid Solana/Anchor code
- ✅ Use correct Anchor macros (`#[program]`, `#[account]`, etc.)
- ✅ Use correct Anchor types (`Account`, `Signer`, `Program`, etc.)
- ✅ Use correct constraints (`init`, `mut`, `seeds`, `bump`, etc.)
- ✅ Follow Solana best practices
- ❌ NOT suggest general Rust code
- ❌ NOT add explanations or markdown

---

## Example: Creating a New Program

### Step 1: Create New Program
1. Click "New Program" in sidebar
2. Choose program type (e.g., "Token Mint")
3. Program is created with scaffold code

### Step 2: Start Editing
```rust
// Scaffold code appears:
pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
    // TODO: mint tokens to an ATA
    Ok(())
}
```

### Step 3: AI Helps Complete
As you type, AI suggests:
```rust
pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
    // [AI suggests:]
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    token::mint_to(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
        amount
    )?;
    Ok(())
}
```

---

## Tab Completion vs AI Completion

### Tab Completion (Tier 1 & 2)
- **Trigger**: `Ctrl+Space` or type `.`, `:`, `#`, `(`
- **Type**: Static suggestions from predefined list
- **Speed**: Instant
- **Examples**: `msg!`, `require!`, `Account`, `Signer`

### AI Completion (Tier 3)
- **Trigger**: Automatic as you type
- **Type**: AI-generated code suggestions
- **Speed**: ~1-2 seconds (API call)
- **Examples**: Full function implementations, CPI calls, account initialization

---

## Configuration

### Editor Settings
```typescript
// In CodePanel.tsx
inlineSuggest: {
  enabled: true,      // ✅ AI completion enabled
  mode: "subword",    // Shows partial word suggestions
}
```

### API Key Required
- Set `GEMINI_API_KEY` environment variable
- Without it, AI completion silently fails (no error shown)
- Static tab completion still works

---

## Best Practices

1. **Start Typing**: AI works best when you provide context
2. **Use Tab**: Accept AI suggestions with `Tab` key
3. **Review Suggestions**: Always review AI suggestions before accepting
4. **Combine with Tab Completion**: Use both for best experience

---

## Troubleshooting

### AI suggestions not appearing?
1. Check `GEMINI_API_KEY` is set
2. Check browser console for errors
3. Ensure you're typing in the code editor (not comments/strings)
4. Wait 1-2 seconds after typing (API call takes time)

### Suggestions are wrong?
- AI is probabilistic - suggestions may vary
- Review and edit as needed
- Provide more context by typing more code

---

## Technical Details

### Files Involved
- `app/actions/ai.ts` - AI completion function
- `components/panels/CodePanel.tsx` - Editor integration
- `lib/solana-completions.ts` - Static completions (Tier 1 & 2)

### API Call
```typescript
generateCodeCompletion(prefix: string, suffix: string)
  → Calls Gemini 1.5 Flash
  → Returns code suggestion
  → Displays as ghost text
```

---

## Summary

**AI Completion helps you:**
- ✅ Write Solana programs faster
- ✅ Learn correct Anchor patterns
- ✅ Complete complex code blocks
- ✅ Work on both templates and new programs

**It's always active** when:
- You're in the code editor
- GEMINI_API_KEY is configured
- You're typing (not in comments/strings)

