use anchor_lang::prelude::*;

declare_id!("Auction111111111111111111111111111111");

#[program]
pub mod marketplace_auction {
    use super::*;

    pub fn initialize_auction(
        ctx: Context<InitializeAuction>,
        min_bid: u64,
        end_ts: i64,
    ) -> Result<()> {
        require!(min_bid > 0, ErrorCode::InvalidBid);
        let now = Clock::get()?.unix_timestamp;
        require!(end_ts > now, ErrorCode::InvalidEndTime);

        let auction = &mut ctx.accounts.auction;
        auction.seller = ctx.accounts.seller.key();
        auction.min_bid = min_bid;
        auction.end_ts = end_ts;
        auction.highest_bid = 0;
        auction.highest_bidder = Pubkey::default();
        auction.settled = false;
        auction.bump = ctx.bumps.vault;

        let vault = &mut ctx.accounts.vault;
        vault.auction = auction.key();
        vault.bump = ctx.bumps.vault;

        msg!("Auction initialized");
        Ok(())
    }

    pub fn place_bid(ctx: Context<PlaceBid>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidBid);
        let auction = &mut ctx.accounts.auction;
        let now = Clock::get()?.unix_timestamp;
        require!(now < auction.end_ts, ErrorCode::AuctionEnded);
        require!(amount >= auction.min_bid, ErrorCode::BidTooLow);
        require!(amount > auction.highest_bid, ErrorCode::BidTooLow);

        if auction.highest_bidder != Pubkey::default() {
            require!(
                ctx.accounts.previous_bidder.key() == auction.highest_bidder,
                ErrorCode::InvalidPreviousBidder
            );
            **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= auction.highest_bid;
            **ctx.accounts.previous_bidder.to_account_info().try_borrow_mut_lamports()? +=
                auction.highest_bid;
        }

        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? += amount;
        **ctx.accounts.bidder.to_account_info().try_borrow_mut_lamports()? -= amount;

        auction.highest_bid = amount;
        auction.highest_bidder = ctx.accounts.bidder.key();
        msg!("Bid placed for {} lamports", amount);
        Ok(())
    }

    pub fn settle(ctx: Context<Settle>) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        let now = Clock::get()?.unix_timestamp;
        require!(now >= auction.end_ts, ErrorCode::AuctionNotEnded);
        require!(!auction.settled, ErrorCode::AlreadySettled);

        if auction.highest_bid > 0 {
            **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= auction.highest_bid;
            **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += auction.highest_bid;
        }

        auction.settled = true;
        msg!("Auction settled");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAuction<'info> {
    #[account(init, payer = seller, space = 8 + Auction::LEN)]
    pub auction: Account<'info, Auction>,
    #[account(
        init,
        payer = seller,
        space = 8 + Vault::LEN,
        seeds = [b"vault", auction.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(mut, seeds = [b"vault", auction.key().as_ref()], bump = auction.bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    /// CHECK: Used to refund the previous highest bidder.
    #[account(mut)]
    pub previous_bidder: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct Settle<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(mut, seeds = [b"vault", auction.key().as_ref()], bump = auction.bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub seller: Signer<'info>,
}

#[account]
pub struct Auction {
    pub seller: Pubkey,
    pub min_bid: u64,
    pub end_ts: i64,
    pub highest_bid: u64,
    pub highest_bidder: Pubkey,
    pub settled: bool,
    pub bump: u8,
}

impl Auction {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 32 + 1 + 1;
}

#[account]
pub struct Vault {
    pub auction: Pubkey,
    pub bump: u8,
}

impl Vault {
    pub const LEN: usize = 32 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Bid must be greater than zero")]
    InvalidBid,
    #[msg("End time must be in the future")]
    InvalidEndTime,
    #[msg("Auction has already ended")]
    AuctionEnded,
    #[msg("Bid is too low")]
    BidTooLow,
    #[msg("Previous bidder account does not match")]
    InvalidPreviousBidder,
    #[msg("Auction has not ended yet")]
    AuctionNotEnded,
    #[msg("Auction already settled")]
    AlreadySettled,
}
