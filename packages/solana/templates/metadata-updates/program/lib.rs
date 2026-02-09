use anchor_lang::prelude::*;
use anchor_spl::metadata::{
    self,
    update_metadata_accounts_v2,
    Metadata,
    mpl_token_metadata::types::DataV2,
};

declare_id!("MetadataUpdate11111111111111111111111111111");

#[program]
pub mod metadata_updates {
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

        metadata::update_metadata_accounts_v2(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                update_metadata_accounts_v2::CpiAccounts {
                    metadata: ctx.accounts.metadata.to_account_info(),
                    update_authority: ctx.accounts.update_authority.to_account_info(),
                },
            ),
            None,
            Some(data),
            Some(true),
            None,
        )?;

        msg!("Metadata updated");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    pub update_authority: Signer<'info>,
    pub token_metadata_program: Program<'info, Metadata>,
}
