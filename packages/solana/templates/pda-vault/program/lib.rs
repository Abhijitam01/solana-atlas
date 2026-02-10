use anchor_lang::prelude::*;

declare_id!("PdaVault11111111111111111111111111111111");

#[program]
pub mod pda_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.bump = ctx.bumps.vault;
        msg!("Vault initialized with authority: {}", vault.authority);
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? += amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? -= amount;
        msg!("Deposited {} lamports into vault", amount);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.vault.authority,
            ErrorCode::Unauthorized
        );
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;
        msg!("Withdrew {} lamports from vault", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::LEN,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub bump: u8,
}

impl Vault {
    pub const LEN: usize = 32 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
}

