use anchor_lang::prelude::*;
use anchor_spl::token::{self, FreezeAccount, ThawAccount, Mint, Token, TokenAccount};

declare_id!("TokFreeze111111111111111111111111111111");

#[program]
pub mod token_freeze_authority {
    use super::*;

    pub fn freeze(ctx: Context<Freeze>) -> Result<()> {
        let cpi_accounts = FreezeAccount {
            account: ctx.accounts.token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.freeze_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::freeze_account(cpi_ctx)?;
        msg!("Token account frozen");
        Ok(())
    }

    pub fn thaw(ctx: Context<Thaw>) -> Result<()> {
        let cpi_accounts = ThawAccount {
            account: ctx.accounts.token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.freeze_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::thaw_account(cpi_ctx)?;
        msg!("Token account thawed");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Freeze<'info> {
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub freeze_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Thaw<'info> {
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub freeze_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
