use anchor_lang::prelude::*;

declare_id!("PdaEscrow1111111111111111111111111111111");

#[program]
pub mod pda_escrow {
    use super::*;

    pub fn create(ctx: Context<CreateEscrow>, amount: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.authority = ctx.accounts.authority.key();
        escrow.amount = amount;
        escrow.bump = ctx.bumps.escrow;
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? += amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? -= amount;
        msg!("Escrow funded with {} lamports", amount);
        Ok(())
    }

    pub fn release(ctx: Context<ReleaseEscrow>) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.escrow.authority,
            ErrorCode::Unauthorized
        );
        let amount = ctx.accounts.escrow.amount;
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;
        ctx.accounts.escrow.amount = 0;
        msg!("Escrow released");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateEscrow<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Escrow::LEN,
        seeds = [b"escrow", authority.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", authority.key().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct Escrow {
    pub authority: Pubkey,
    pub amount: u64,
    pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 32 + 8 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
}
