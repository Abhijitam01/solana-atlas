use anchor_lang::prelude::*;

declare_id!("ErrHandling1111111111111111111111111111111");

#[program]
pub mod error_handling_patterns {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, limit: u64) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.limit = limit;
        state.used = 0;
        msg!("State initialized with limit {}", limit);
        Ok(())
    }

    pub fn consume(ctx: Context<Consume>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.state.authority,
            ErrorCode::Unauthorized
        );
        require!(amount > 0, ErrorCode::InvalidAmount);
        let new_used = ctx.accounts.state.used.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        require!(new_used <= ctx.accounts.state.limit, ErrorCode::LimitExceeded);
        ctx.accounts.state.used = new_used;
        msg!("Consumed {} units", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + UsageState::LEN)]
    pub state: Account<'info, UsageState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Consume<'info> {
    #[account(mut)]
    pub state: Account<'info, UsageState>,
    pub authority: Signer<'info>,
}

#[account]
pub struct UsageState {
    pub authority: Pubkey,
    pub limit: u64,
    pub used: u64,
}

impl UsageState {
    pub const LEN: usize = 32 + 8 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Usage limit exceeded")]
    LimitExceeded,
    #[msg("Overflow when adding")]
    Overflow,
}
