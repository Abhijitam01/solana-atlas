use anchor_lang::prelude::*;

declare_id!("UpAuth11111111111111111111111111111111");

#[program]
pub mod upgrade_authority {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = authority;
        state.frozen = false;
        msg!("Upgrade authority initialized");
        Ok(())
    }

    pub fn rotate_authority(ctx: Context<RotateAuthority>, new_authority: Pubkey) -> Result<()> {
        require!(ctx.accounts.current_authority.key() == ctx.accounts.state.authority, ErrorCode::Unauthorized);
        require!(!ctx.accounts.state.frozen, ErrorCode::Frozen);
        ctx.accounts.state.authority = new_authority;
        msg!("Upgrade authority rotated");
        Ok(())
    }

    pub fn freeze_authority(ctx: Context<RotateAuthority>) -> Result<()> {
        require!(ctx.accounts.current_authority.key() == ctx.accounts.state.authority, ErrorCode::Unauthorized);
        ctx.accounts.state.frozen = true;
        msg!("Upgrade authority frozen");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + UpgradeState::LEN)]
    pub state: Account<'info, UpgradeState>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RotateAuthority<'info> {
    #[account(mut)]
    pub state: Account<'info, UpgradeState>,
    pub current_authority: Signer<'info>,
}

#[account]
pub struct UpgradeState {
    pub authority: Pubkey,
    pub frozen: bool,
}

impl UpgradeState {
    pub const LEN: usize = 32 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Authority is frozen")]
    Frozen,
}
