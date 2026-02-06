use anchor_lang::prelude::*;

declare_id!("AuthValid1111111111111111111111111111111");

#[program]
pub mod authority_validation {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.admin = admin;
        state.operator = ctx.accounts.operator.key();
        msg!("State initialized");
        Ok(())
    }

    pub fn set_operator(ctx: Context<SetOperator>, new_operator: Pubkey) -> Result<()> {
        require!(ctx.accounts.admin.key() == ctx.accounts.state.admin, ErrorCode::Unauthorized);
        ctx.accounts.state.operator = new_operator;
        msg!("Operator updated");
        Ok(())
    }

    pub fn execute(ctx: Context<Execute>) -> Result<()> {
        require!(ctx.accounts.operator.key() == ctx.accounts.state.operator, ErrorCode::Unauthorized);
        msg!("Privileged action executed");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = operator, space = 8 + AuthorityState::LEN)]
    pub state: Account<'info, AuthorityState>,
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetOperator<'info> {
    #[account(mut)]
    pub state: Account<'info, AuthorityState>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct Execute<'info> {
    pub state: Account<'info, AuthorityState>,
    pub operator: Signer<'info>,
}

#[account]
pub struct AuthorityState {
    pub admin: Pubkey,
    pub operator: Pubkey,
}

impl AuthorityState {
    pub const LEN: usize = 32 + 32;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
}
