use anchor_lang::prelude::*;

declare_id!("EscrowMulti111111111111111111111111111111");

#[program]
pub mod pda_escrow_multi_party {
    use super::*;

    pub fn create(ctx: Context<CreateEscrow>, amount: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = ctx.accounts.seller.key();
        escrow.arbiter = ctx.accounts.arbiter.key();
        escrow.amount = amount;
        escrow.bump = ctx.bumps.escrow;
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? += amount;
        **ctx.accounts.buyer.to_account_info().try_borrow_mut_lamports()? -= amount;
        msg!("Escrow funded by buyer");
        Ok(())
    }

    pub fn release(ctx: Context<ReleaseEscrow>) -> Result<()> {
        require!(ctx.accounts.arbiter.key() == ctx.accounts.escrow.arbiter, ErrorCode::Unauthorized);
        let amount = ctx.accounts.escrow.amount;
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += amount;
        ctx.accounts.escrow.amount = 0;
        msg!("Escrow released to seller");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateEscrow<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + Escrow::LEN,
        seeds = [b"escrow", buyer.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub seller: SystemAccount<'info>,
    pub arbiter: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", buyer.key().as_ref(), seller.key().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub buyer: SystemAccount<'info>,
    #[account(mut)]
    pub seller: SystemAccount<'info>,
    pub arbiter: Signer<'info>,
}

#[account]
pub struct Escrow {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub arbiter: Pubkey,
    pub amount: u64,
    pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
}
