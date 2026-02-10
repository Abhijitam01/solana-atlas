use anchor_lang::prelude::*;
use mpl_token_metadata::instruction::update_metadata_accounts_v2;
use mpl_token_metadata::state::DataV2;
use solana_program::program::invoke;

declare_id!("MetaUpdateAdv11111111111111111111111111111");

#[program]
pub mod metadata_updates_advanced {
    use super::*;

    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let data = DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };
        let ix = update_metadata_accounts_v2(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.update_authority.key(),
            None,
            Some(data),
            None,
            Some(true),
        );
        invoke(
            &ix,
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.update_authority.to_account_info(),
            ],
        )?;
        msg!("Metadata updated and immutable");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    /// CHECK: Metaplex metadata account is verified by the CPI program
    pub metadata: UncheckedAccount<'info>,
    pub update_authority: Signer<'info>,
    /// CHECK: Metaplex Token Metadata program
    pub token_metadata_program: UncheckedAccount<'info>,
}
