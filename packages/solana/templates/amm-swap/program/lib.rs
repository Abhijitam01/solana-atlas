use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("AmmSwap1111111111111111111111111111111");

#[program]
pub mod amm_swap {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.pool_authority.key();
        pool.mint_a = ctx.accounts.mint_a.key();
        pool.mint_b = ctx.accounts.mint_b.key();
        pool.vault_a = ctx.accounts.vault_a.key();
        pool.vault_b = ctx.accounts.vault_b.key();
        pool.bump = ctx.bumps.pool_authority;
        msg!("AMM pool initialized");
        Ok(())
    }

    pub fn swap(ctx: Context<Swap>, amount_in: u64) -> Result<()> {
        let pool = &ctx.accounts.pool;
        let vault_in = &ctx.accounts.vault_in;
        let vault_out = &ctx.accounts.vault_out;

        require!(
            (vault_in.key() == pool.vault_a && vault_out.key() == pool.vault_b)
                || (vault_in.key() == pool.vault_b && vault_out.key() == pool.vault_a),
            ErrorCode::InvalidVaults
        );
        require!(vault_in.amount > 0 && vault_out.amount > 0, ErrorCode::EmptyPool);

        let amount_out = amount_in
            .checked_mul(vault_out.amount)
            .and_then(|v| v.checked_div(vault_in.amount + amount_in))
            .ok_or(ErrorCode::MathOverflow)?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.user_in.to_account_info(),
                    to: ctx.accounts.vault_in.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_in,
        )?;

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"authority",
            pool.key().as_ref(),
            &[pool.bump],
        ]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.vault_out.to_account_info(),
                    to: ctx.accounts.user_out.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount_out,
        )?;

        msg!("Swapped {} for {}", amount_in, amount_out);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init, payer = payer, space = 8 + Pool::LEN)]
    pub pool: Account<'info, Pool>,
    /// CHECK: PDA authority for the vaults.
    #[account(seeds = [b"authority", pool.key().as_ref()], bump)]
    pub pool_authority: UncheckedAccount<'info>,
    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,
    #[account(mut, token::mint = mint_a, token::authority = pool_authority)]
    pub vault_a: Account<'info, TokenAccount>,
    #[account(mut, token::mint = mint_b, token::authority = pool_authority)]
    pub vault_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    pub pool: Account<'info, Pool>,
    /// CHECK: PDA authority for the vaults.
    #[account(seeds = [b"authority", pool.key().as_ref()], bump = pool.bump)]
    pub pool_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub vault_in: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_out: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_in: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_out: Account<'info, TokenAccount>,
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub vault_a: Pubkey,
    pub vault_b: Pubkey,
    pub bump: u8,
}

impl Pool {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 32 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Vault accounts do not match the pool configuration")]
    InvalidVaults,
    #[msg("Pool has no liquidity")]
    EmptyPool,
    #[msg("Math overflow")]
    MathOverflow,
}
