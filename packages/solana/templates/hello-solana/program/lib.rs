use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod hello_solana {
    use super::*;

    pub fn say_hello(ctx: Context<SayHello>) -> Result<()> {
        msg!("Hello, Solana!");
        msg!("Program ID: {}", ctx.program_id);
        msg!("User: {}", ctx.accounts.user.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SayHello<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

