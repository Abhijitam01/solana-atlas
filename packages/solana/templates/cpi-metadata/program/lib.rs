use anchor_lang::prelude::*;
use mpl_token_metadata::instruction::update_metadata_accounts_v2;
use solana_program::program::invoke;

declare_id!("CpiMeta1111111111111111111111111111111");

#[program]
pub mod cpi_metadata {
    use super::*;

    pub fn update_uri(ctx: Context<UpdateUri>, uri: String) -> Result<()> {
        let ix = update_metadata_accounts_v2(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.update_authority.key(),
            None,
            None,
            Some(uri),
            None,
        );
        invoke(
            &ix,
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.update_authority.to_account_info(),
            ],
        )?;
        msg!("Metadata URI updated via CPI");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateUri<'info> {
    /// CHECK: Metaplex metadata account verified by CPI program
    pub metadata: UncheckedAccount<'info>,
    pub update_authority: Signer<'info>,
    /// CHECK: Metaplex Token Metadata program
    pub token_metadata_program: UncheckedAccount<'info>,
}
