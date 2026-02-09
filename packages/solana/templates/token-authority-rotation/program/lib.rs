use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, SetAuthority, Token};
use spl_token::instruction::AuthorityType;

declare_id!("TokAuthRot111111111111111111111111111111");

#[program]
pub mod token_authority_rotation {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.current_authority = ctx.accounts.current_authority.key();
        msg!("Rotation state initialized");
        Ok(())
    }

    pub fn rotate_mint_authority(ctx: Context<RotateAuthority>) -> Result<()> {
        require!(
            ctx.accounts.current_authority.key() == ctx.accounts.state.current_authority,
            ErrorCode::Unauthorized
        );
        let cpi_accounts = SetAuthority {
            current_authority: ctx.accounts.current_authority.to_account_info(),
            account_or_mint: ctx.accounts.mint.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::set_authority(
            cpi_ctx,
            AuthorityType::MintTokens,
            Some(ctx.accounts.new_authority.key())
        )?;
        ctx.accounts.state.current_authority = ctx.accounts.new_authority.key();
        msg!("Mint authority rotated");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = current_authority, space = 8 + RotationState::LEN)]
    pub state: Account<'info, RotationState>,
    #[account(mut)]
    pub current_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RotateAuthority<'info> {
    #[account(mut)]
    pub state: Account<'info, RotationState>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub current_authority: Signer<'info>,
    pub new_authority: SystemAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct RotationState {
    pub current_authority: Pubkey,
}

impl RotationState {
    pub const LEN: usize = 32;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
}
