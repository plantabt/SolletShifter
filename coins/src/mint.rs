use mpl_token_metadata::accounts::Metadata;
use solana_client::rpc_client::RpcClient;
use mpl_token_metadata::accounts::{ MasterEdition, Metadata as MetadataAccount };


pub fn find_pda(mint: solana_sdk::pubkey::Pubkey) -> (solana_program::pubkey::Pubkey, u8) {
    solana_program::pubkey::Pubkey::find_program_address(
        &[
            "metadata".as_bytes(),
            mpl_token_metadata::programs::MPL_TOKEN_METADATA_ID.as_ref(),
            mint.as_ref(),
        ],
        &mpl_token_metadata::programs::MPL_TOKEN_METADATA_ID,
    )
}
/*
pub async fn get_token_name(token: &str) -> Option<String> {
    let token_pubkey = solana_sdk::pubkey::Pubkey::from_str(&token).unwrap();

    let (metadata_pubkey,_) = find_pda(token_pubkey);
    match crypt_client.solana.get_account_data(&token_pubkey) {
        Ok( data) => {
            let mdata = data.clone();
            QuickLogger::Warn(&format!("account data:{:#?}\r\n",data));
            let dec_mdata = MetadataAccount::deserialize(&mut mdata.as_slice()).unwrap();
            QuickLogger::Warn(&format!("dec_mdata:{:#?}\r\n",dec_mdata));
            /*
            match Metadata::try_from_slice(&data) {
                Ok(metadata) => println!("Mint Name: {}", metadata.name),
                Err(e) => println!("Failed to deserialize Metadata: {:?}", e),
            } */
        },
        Err(e) => println!("Failed to retrieve account data: {:?}", e),
    } 
} */