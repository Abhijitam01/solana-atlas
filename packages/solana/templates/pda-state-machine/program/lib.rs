use anchor_lang::prelude::*;

declare_id!("PdaState11111111111111111111111111111111");

#[program]
pub mod pda_state_machine {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let machine = &mut ctx.accounts.machine;
        machine.authority = ctx.accounts.authority.key();
        machine.state = MachineState::Idle;
        machine.bump = ctx.bumps.machine;
        msg!("State machine initialized");
        Ok(())
    }

    pub fn advance(ctx: Context<Advance>) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.machine.authority,
            ErrorCode::Unauthorized
        );
        ctx.accounts.machine.state = ctx.accounts.machine.state.next();
        msg!("State advanced");
        Ok(())
    }

    pub fn reset(ctx: Context<Advance>) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.machine.authority,
            ErrorCode::Unauthorized
        );
        ctx.accounts.machine.state = MachineState::Idle;
        msg!("State reset");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Machine::LEN,
        seeds = [b"machine", authority.key().as_ref()],
        bump
    )]
    pub machine: Account<'info, Machine>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Advance<'info> {
    #[account(
        mut,
        seeds = [b"machine", authority.key().as_ref()],
        bump = machine.bump
    )]
    pub machine: Account<'info, Machine>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Machine {
    pub authority: Pubkey,
    pub state: MachineState,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum MachineState {
    Idle,
    Running,
    Complete,
}

impl MachineState {
    pub fn next(self) -> Self {
        match self {
            MachineState::Idle => MachineState::Running,
            MachineState::Running => MachineState::Complete,
            MachineState::Complete => MachineState::Complete,
        }
    }
}

impl Machine {
    pub const LEN: usize = 32 + 1 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
}
