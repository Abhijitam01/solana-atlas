use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

declare_id!("CpiCalls1111111111111111111111111111111");

#[program]
pub mod cpi_calls {
    use super::*;

    pub fn transfer_lamports(ctx: Context<TransferLamports>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        system_program::transfer(cpi_ctx, amount)?;
        msg!("Transferred {} lamports", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferLamports<'info> {
    #[account(mut)]
    pub from: Signer<'info>,
    #[account(mut)]
    pub to: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}
