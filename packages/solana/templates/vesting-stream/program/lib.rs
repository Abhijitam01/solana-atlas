use anchor_lang::prelude::*;

declare_id!("Vesting1111111111111111111111111111111");

#[program]
pub mod vesting_stream {
    use super::*;

    pub fn initialize_vesting(
        ctx: Context<InitializeVesting>,
        total_amount: u64,
        start_ts: i64,
        cliff_ts: i64,
        end_ts: i64,
    ) -> Result<()> {
        require!(total_amount > 0, ErrorCode::InvalidAmount);
        require!(start_ts < end_ts, ErrorCode::InvalidSchedule);
        require!(cliff_ts >= start_ts && cliff_ts <= end_ts, ErrorCode::InvalidSchedule);

        let vesting = &mut ctx.accounts.vesting;
        vesting.authority = ctx.accounts.authority.key();
        vesting.beneficiary = ctx.accounts.beneficiary.key();
        vesting.total_amount = total_amount;
        vesting.released_amount = 0;
        vesting.start_ts = start_ts;
        vesting.cliff_ts = cliff_ts;
        vesting.end_ts = end_ts;
        vesting.bump = ctx.bumps.vault;

        let vault = &mut ctx.accounts.vault;
        vault.vesting = vesting.key();
        vault.bump = ctx.bumps.vault;

        msg!("Vesting stream initialized");
        Ok(())
    }

    pub fn fund(ctx: Context<Fund>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? += amount;
        **ctx.accounts.funder.to_account_info().try_borrow_mut_lamports()? -= amount;
        msg!("Funded {} lamports", amount);
        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let vesting = &mut ctx.accounts.vesting;
        let now = Clock::get()?.unix_timestamp;
        require!(now >= vesting.cliff_ts, ErrorCode::CliffNotReached);

        let vested = if now >= vesting.end_ts {
            vesting.total_amount
        } else {
            let elapsed = now - vesting.start_ts;
            let duration = vesting.end_ts - vesting.start_ts;
            let vested_i128 = (vesting.total_amount as i128)
                .checked_mul(elapsed as i128)
                .and_then(|v| v.checked_div(duration as i128))
                .ok_or(ErrorCode::MathOverflow)?;
            vested_i128 as u64
        };

        let available = vested
            .checked_sub(vesting.released_amount)
            .ok_or(ErrorCode::MathOverflow)?;
        require!(available > 0, ErrorCode::NothingToClaim);

        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= available;
        **ctx.accounts.beneficiary.to_account_info().try_borrow_mut_lamports()? += available;
        vesting.released_amount = vesting
            .released_amount
            .checked_add(available)
            .ok_or(ErrorCode::MathOverflow)?;

        msg!("Claimed {} lamports", available);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVesting<'info> {
    #[account(init, payer = authority, space = 8 + Vesting::LEN)]
    pub vesting: Account<'info, Vesting>,
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::LEN,
        seeds = [b"vault", vesting.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Beneficiary can be any account.
    pub beneficiary: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Fund<'info> {
    pub vesting: Account<'info, Vesting>,
    #[account(mut, seeds = [b"vault", vesting.key().as_ref()], bump = vesting.bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub funder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub vesting: Account<'info, Vesting>,
    #[account(mut, seeds = [b"vault", vesting.key().as_ref()], bump = vesting.bump)]
    pub vault: Account<'info, Vault>,
    /// CHECK: Beneficiary receives lamports.
    #[account(mut)]
    pub beneficiary: UncheckedAccount<'info>,
}

#[account]
pub struct Vesting {
    pub authority: Pubkey,
    pub beneficiary: Pubkey,
    pub total_amount: u64,
    pub released_amount: u64,
    pub start_ts: i64,
    pub cliff_ts: i64,
    pub end_ts: i64,
    pub bump: u8,
}

impl Vesting {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct Vault {
    pub vesting: Pubkey,
    pub bump: u8,
}

impl Vault {
    pub const LEN: usize = 32 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Schedule is invalid")]
    InvalidSchedule,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Cliff has not been reached")]
    CliffNotReached,
    #[msg("Nothing available to claim")]
    NothingToClaim,
}
