use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::metadata::{
    Metadata, MetadataAccount, MasterEditionAccount, create_metadata_accounts_v3,
    mpl_token_metadata::types::DataV2,
};

declare_id!("NftMint11111111111111111111111111111111");

#[program]
pub mod nft_mint {
    use super::*;

    pub fn create_nft(
        ctx: Context<CreateNft>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        msg!("Creating NFT: {} ({})", name, symbol);
        
        let metadata_accounts = create_metadata_accounts_v3(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                create_metadata_accounts_v3::CpiAccounts {
                    metadata: ctx.accounts.metadata.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    mint_authority: ctx.accounts.mint_authority.to_account_info(),
                    update_authority: ctx.accounts.mint_authority.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                },
            ),
            DataV2 {
                name,
                symbol,
                uri,
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            false,
            true,
            None,
        )?;

        msg!("NFT created successfully");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateNft<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: We're not using this account for anything
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

