use anchor_lang::prelude::*;

declare_id!("DaoGov1111111111111111111111111111111");

#[program]
pub mod governance_dao {
    use super::*;

    pub fn initialize_dao(ctx: Context<InitializeDao>, quorum: u64) -> Result<()> {
        require!(quorum > 0, ErrorCode::InvalidQuorum);
        let dao = &mut ctx.accounts.dao;
        dao.authority = ctx.accounts.authority.key();
        dao.quorum = quorum;
        dao.proposal_count = 0;
        dao.bump = ctx.bumps.dao;
        msg!("DAO initialized");
        Ok(())
    }

    pub fn create_proposal(ctx: Context<CreateProposal>, proposal_id: u64) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        require!(proposal_id == dao.proposal_count, ErrorCode::InvalidProposalId);
        let proposal = &mut ctx.accounts.proposal;
        proposal.dao = dao.key();
        proposal.id = proposal_id;
        proposal.yes = 0;
        proposal.no = 0;
        proposal.executed = false;
        dao.proposal_count = dao.proposal_count.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
        msg!("Proposal {} created", proposal_id);
        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, approve: bool) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(!proposal.executed, ErrorCode::AlreadyExecuted);
        let record = &mut ctx.accounts.vote_record;
        require!(!record.voted, ErrorCode::AlreadyVoted);

        if approve {
            proposal.yes = proposal.yes.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
        } else {
            proposal.no = proposal.no.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
        }

        record.voter = ctx.accounts.voter.key();
        record.proposal = proposal.key();
        record.voted = true;
        msg!("Vote recorded");
        Ok(())
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let dao = &ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;
        require!(!proposal.executed, ErrorCode::AlreadyExecuted);
        require!(proposal.yes >= dao.quorum, ErrorCode::NotEnoughVotes);
        proposal.executed = true;
        msg!("Proposal executed");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeDao<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Dao::LEN,
        seeds = [b"dao", authority.key().as_ref()],
        bump
    )]
    pub dao: Account<'info, Dao>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CreateProposal<'info> {
    #[account(mut, seeds = [b"dao", authority.key().as_ref()], bump = dao.bump)]
    pub dao: Account<'info, Dao>,
    #[account(
        init,
        payer = creator,
        space = 8 + Proposal::LEN,
        seeds = [b"proposal", dao.key().as_ref(), proposal_id.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub creator: Signer<'info>,
    /// CHECK: Only used as seed reference.
    pub authority: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    pub dao: Account<'info, Dao>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init,
        payer = voter,
        space = 8 + VoteRecord::LEN,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    pub dao: Account<'info, Dao>,
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
}

#[account]
pub struct Dao {
    pub authority: Pubkey,
    pub quorum: u64,
    pub proposal_count: u64,
    pub bump: u8,
}

impl Dao {
    pub const LEN: usize = 32 + 8 + 8 + 1;
}

#[account]
pub struct Proposal {
    pub dao: Pubkey,
    pub id: u64,
    pub yes: u64,
    pub no: u64,
    pub executed: bool,
}

impl Proposal {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1;
}

#[account]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub proposal: Pubkey,
    pub voted: bool,
}

impl VoteRecord {
    pub const LEN: usize = 32 + 32 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Quorum must be greater than zero")]
    InvalidQuorum,
    #[msg("Proposal id does not match the next counter")]
    InvalidProposalId,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Proposal already executed")]
    AlreadyExecuted,
    #[msg("Vote already recorded")]
    AlreadyVoted,
    #[msg("Not enough yes votes to execute")]
    NotEnoughVotes,
}
