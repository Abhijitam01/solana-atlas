use anchor_lang::prelude::*;

declare_id!("StakePool111111111111111111111111111111");

#[program]
pub mod staking_pool {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.total_staked = 0;
        pool.total_shares = 0;
        pool.bump = ctx.bumps.pool;
        msg!("Staking pool initialized");
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        let pool = &mut ctx.accounts.pool;
        let stake = &mut ctx.accounts.stake_account;

        let shares = if pool.total_shares == 0 || pool.total_staked == 0 {
            amount
        } else {
            amount
                .checked_mul(pool.total_shares)
                .and_then(|v| v.checked_div(pool.total_staked))
                .ok_or(ErrorCode::MathOverflow)?
        };

        **pool.to_account_info().try_borrow_mut_lamports()? += amount;
        **ctx.accounts.staker.to_account_info().try_borrow_mut_lamports()? -= amount;

        pool.total_staked = pool.total_staked.checked_add(amount).ok_or(ErrorCode::MathOverflow)?;
        pool.total_shares = pool.total_shares.checked_add(shares).ok_or(ErrorCode::MathOverflow)?;
        stake.owner = ctx.accounts.staker.key();
        stake.shares = stake.shares.checked_add(shares).ok_or(ErrorCode::MathOverflow)?;

        msg!("Deposited {} lamports for {} shares", amount, shares);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, shares: u64) -> Result<()> {
        require!(shares > 0, ErrorCode::InvalidAmount);
        let pool = &mut ctx.accounts.pool;
        let stake = &mut ctx.accounts.stake_account;
        require!(stake.owner == ctx.accounts.staker.key(), ErrorCode::Unauthorized);
        require!(shares <= stake.shares, ErrorCode::NotEnoughShares);

        let amount = shares
            .checked_mul(pool.total_staked)
            .and_then(|v| v.checked_div(pool.total_shares))
            .ok_or(ErrorCode::MathOverflow)?;

        **pool.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.staker.to_account_info().try_borrow_mut_lamports()? += amount;

        pool.total_staked = pool.total_staked.checked_sub(amount).ok_or(ErrorCode::MathOverflow)?;
        pool.total_shares = pool.total_shares.checked_sub(shares).ok_or(ErrorCode::MathOverflow)?;
        stake.shares = stake.shares.checked_sub(shares).ok_or(ErrorCode::MathOverflow)?;

        msg!("Withdrew {} lamports for {} shares", amount, shares);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Pool::LEN,
        seeds = [b"pool", authority.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut, seeds = [b"pool", authority.key().as_ref()], bump = pool.bump)]
    pub pool: Account<'info, Pool>,
    #[account(
        init,
        payer = staker,
        space = 8 + StakeAccount::LEN,
        seeds = [b"stake", pool.key().as_ref(), staker.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub staker: Signer<'info>,
    /// CHECK: Used only as a PDA seed reference.
    pub authority: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [b"pool", authority.key().as_ref()], bump = pool.bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut, seeds = [b"stake", pool.key().as_ref(), staker.key().as_ref()], bump)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub staker: Signer<'info>,
    /// CHECK: Used only as a PDA seed reference.
    pub authority: UncheckedAccount<'info>,
}

#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub total_staked: u64,
    pub total_shares: u64,
    pub bump: u8,
}

impl Pool {
    pub const LEN: usize = 32 + 8 + 8 + 1;
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub shares: u64,
}

impl StakeAccount {
    pub const LEN: usize = 32 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Staker is not the owner")]
    Unauthorized,
    #[msg("Not enough shares")]
    NotEnoughShares,
}
