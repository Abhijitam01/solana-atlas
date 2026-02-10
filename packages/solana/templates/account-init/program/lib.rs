use anchor_lang::prelude::*;

declare_id!("AccountInit1111111111111111111111111111111");

#[program]
pub mod account_init {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        let account = &mut ctx.accounts.my_account;
        account.data = data;
        account.authority = ctx.accounts.user.key();
        msg!("Initialized account with data: {}", data);
        Ok(())
    }

    pub fn update(ctx: Context<Update>, new_data: u64) -> Result<()> {
        let account = &mut ctx.accounts.my_account;
        require!(
            account.authority == ctx.accounts.user.key(),
            ErrorCode::Unauthorized
        );
        account.data = new_data;
        msg!("Updated account data to: {}", new_data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + MyAccount::LEN
    )]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
    pub user: Signer<'info>,
}

#[account]
pub struct MyAccount {
    pub data: u64,
    pub authority: Pubkey,
}

impl MyAccount {
    pub const LEN: usize = 8 + 8 + 32;
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
}

