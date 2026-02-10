use anchor_lang::prelude::*;

declare_id!("MultiSig1111111111111111111111111111111");

#[program]
pub mod multisig_treasury {
    use super::*;

    pub fn initialize_multisig(ctx: Context<InitializeMultisig>, threshold: u8) -> Result<()> {
        require!(threshold > 0 && threshold <= 3, ErrorCode::InvalidThreshold);
        let multisig = &mut ctx.accounts.multisig;
        multisig.owners = [
            ctx.accounts.owner_one.key(),
            ctx.accounts.owner_two.key(),
            ctx.accounts.owner_three.key(),
        ];
        multisig.threshold = threshold;
        multisig.bump = ctx.bumps.vault;

        let vault = &mut ctx.accounts.vault;
        vault.multisig = multisig.key();
        vault.bump = ctx.bumps.vault;
        msg!("Multisig initialized");
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? += amount;
        **ctx.accounts.depositor.to_account_info().try_borrow_mut_lamports()? -= amount;
        msg!("Deposited {} lamports", amount);
        Ok(())
    }

    pub fn create_proposal(ctx: Context<CreateProposal>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        let proposal = &mut ctx.accounts.proposal;
        proposal.multisig = ctx.accounts.multisig.key();
        proposal.recipient = ctx.accounts.recipient.key();
        proposal.amount = amount;
        proposal.approvals = [false; 3];
        proposal.executed = false;
        msg!("Proposal created");
        Ok(())
    }

    pub fn approve(ctx: Context<Approve>) -> Result<()> {
        let idx = owner_index(&ctx.accounts.multisig, ctx.accounts.owner.key())?;
        let proposal = &mut ctx.accounts.proposal;
        require!(!proposal.executed, ErrorCode::AlreadyExecuted);
        proposal.approvals[idx] = true;
        msg!("Owner approved proposal");
        Ok(())
    }

    pub fn execute(ctx: Context<Execute>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(!proposal.executed, ErrorCode::AlreadyExecuted);
        require!(proposal.amount > 0, ErrorCode::InvalidAmount);
        require!(proposal.multisig == ctx.accounts.multisig.key(), ErrorCode::InvalidProposal);

        let approvals = proposal.approvals.iter().filter(|a| **a).count() as u8;
        require!(approvals >= ctx.accounts.multisig.threshold, ErrorCode::NotEnoughApprovals);

        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= proposal.amount;
        **ctx.accounts.recipient.to_account_info().try_borrow_mut_lamports()? += proposal.amount;
        proposal.executed = true;
        msg!("Proposal executed");
        Ok(())
    }
}

fn owner_index(multisig: &Multisig, key: Pubkey) -> Result<usize> {
    if key == multisig.owners[0] {
        return Ok(0);
    }
    if key == multisig.owners[1] {
        return Ok(1);
    }
    if key == multisig.owners[2] {
        return Ok(2);
    }
    Err(ErrorCode::Unauthorized.into())
}

#[derive(Accounts)]
pub struct InitializeMultisig<'info> {
    #[account(init, payer = payer, space = 8 + Multisig::LEN)]
    pub multisig: Account<'info, Multisig>,
    #[account(
        init,
        payer = payer,
        space = 8 + Vault::LEN,
        seeds = [b"vault", multisig.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub owner_one: Signer<'info>,
    pub owner_two: Signer<'info>,
    pub owner_three: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    pub multisig: Account<'info, Multisig>,
    #[account(seeds = [b"vault", multisig.key().as_ref()], bump = multisig.bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    pub multisig: Account<'info, Multisig>,
    #[account(seeds = [b"vault", multisig.key().as_ref()], bump = multisig.bump)]
    pub vault: Account<'info, Vault>,
    #[account(init, payer = proposer, space = 8 + Proposal::LEN)]
    pub proposal: Account<'info, Proposal>,
    /// CHECK: Recipient can be any account.
    pub recipient: UncheckedAccount<'info>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Approve<'info> {
    pub multisig: Account<'info, Multisig>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct Execute<'info> {
    pub multisig: Account<'info, Multisig>,
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    /// CHECK: Recipient can be any account.
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,
}

#[account]
pub struct Multisig {
    pub owners: [Pubkey; 3],
    pub threshold: u8,
    pub bump: u8,
}

impl Multisig {
    pub const LEN: usize = (32 * 3) + 1 + 1;
}

#[account]
pub struct Vault {
    pub multisig: Pubkey,
    pub bump: u8,
}

impl Vault {
    pub const LEN: usize = 32 + 1;
}

#[account]
pub struct Proposal {
    pub multisig: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub approvals: [bool; 3],
    pub executed: bool,
}

impl Proposal {
    pub const LEN: usize = 32 + 32 + 8 + 3 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Threshold must be between 1 and 3")]
    InvalidThreshold,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Owner is not part of the multisig")]
    Unauthorized,
    #[msg("Proposal already executed")]
    AlreadyExecuted,
    #[msg("Proposal does not match multisig")]
    InvalidProposal,
    #[msg("Not enough approvals")]
    NotEnoughApprovals,
}
