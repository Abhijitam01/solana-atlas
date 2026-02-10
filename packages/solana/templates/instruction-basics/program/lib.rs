use anchor_lang::prelude::*;

declare_id!("InstrBasics11111111111111111111111111111");

#[program]
pub mod instruction_basics {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, start: u64) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.value = start;
        counter.authority = ctx.accounts.authority.key();
        msg!("Counter initialized to {}", start);
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.value = counter
            .value
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        msg!("Counter incremented to {}", counter.value);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Counter::LEN
    )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Counter {
    pub authority: Pubkey,
    pub value: u64,
}

impl Counter {
    pub const LEN: usize = 32 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Counter overflow")]
    Overflow,
}
