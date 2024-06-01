use anchor_lang::prelude::*;

declare_id!("8kVRtF6vR8fD9yjhVRftCAVJ5W25XjRQ8E8ko6HN5wBJ");

#[program]
pub mod solana_service {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
