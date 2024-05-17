use std::str::FromStr;
use anchor_spl::token_2022::spl_token_2022::native_mint::PROGRAM_ADDRESS_SEEDS;
use solana_transaction_status::{option_serializer::OptionSerializer, parse_instruction::ParsedInstruction, EncodedConfirmedTransactionWithStatusMeta, UiInnerInstructions, UiTransactionEncoding};
use crate::mint::find_pda;
use solana_client::rpc_client::{GetConfirmedSignaturesForAddress2Config, RpcClient};
use chrono::{NaiveDateTime, TimeZone};
use solana_program::pubkey::Pubkey;
use mpl_token_metadata::accounts::{ MasterEdition, Metadata as MetadataAccount };

use solana_client::rpc_request::TokenAccountsFilter;
pub struct SolanaCoin{
    pub client:RpcClient
}
impl SolanaCoin{
    pub fn new(net_addr:&str)->Self{
        let client = RpcClient::new(net_addr);
        SolanaCoin{
            client
        }
    }
    /*
    Metadata {
    key: MetadataV1,
    update_authority: Q6XprfkF8RQQKoQVG33xT88H7wi8Uk1B1CC7YAs69Gi,
    mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB,
    name: "USDT\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    symbol: "USDT\0\0\0\0\0\0",
    uri: "\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0",
    seller_fee_basis_points: 0,
    creators: None,
    primary_sale_happened: false,
    is_mutable: true,
    edition_nonce: Some(
        255,
    ),
    token_standard: None,
    collection: None,
    uses: None,
    collection_details: None,
    programmable_config: None,
    }
    */
    pub fn get_token_name(&self,token: &str) -> Option<String> {
        let token_pubkey =  Pubkey::from_str(&token).unwrap();
    
        let (metadata_pubkey,_) = find_pda(token_pubkey);
          match self.client.get_account_data(&metadata_pubkey) {
            Ok( data) => {
                let mdata = data.clone();
                //QuickLogger::Warn(&format!("account data:{:#?}\r\n",data));

                let dec_mdata = MetadataAccount::safe_deserialize(&mut mdata.as_slice()).unwrap();
                let mint_name=dec_mdata.name.trim_matches('\0').to_string();
                //QuickLogger::Warn(&format!("dec_mdata:{:#?}\r\n",dec_mdata.name.trim_matches('\0').to_string()));
                Some(mint_name)
                /*
                match Metadata::try_from_slice(&data) {
                    Ok(metadata) => println!("Mint Name: {}", metadata.name),
                    Err(e) => println!("Failed to deserialize Metadata: {:?}", e),
                } */
            },
            Err(e) => {
                None
            }
        }
   
    }
    pub fn get_balance(&self, pubkey: &Pubkey) -> Option<f64>{
        let balance_result = self.client.get_balance(pubkey);
        match balance_result {
            Ok(balance) => {
                Some(lamports_to_sol(balance))
                
            },
            Err(e) => {
                QuickLogger::Error(&format!("get balance error: {:?}",e));
                Some(0.0)
                
            },
        }
        
        //QuickLogger::Warn(&format!("balance:{:#?}\r\n",balance));
    }
    fn parse_transfer(&self,tx:&EncodedConfirmedTransactionWithStatusMeta,parsed_inst:&ParsedInstruction)->Option<serde_json::Value>{
        //QuickLogger::Warn(&format!("parsed_inst: {:?}",parsed_inst));
        /*
        ParsedInstruction{
        program: "system",
        program_id: "11111111111111111111111111111111",
        parsed: Object{
            "info": Object{
            "destination": String("B4RdtaM6rPfznCJw9ztNWkLrscHqJDdt1Hbr3RTvb61S"),
            "lamports": Number(1000000),
            "source": String("273pPaNDA8CqUb46fevr2B3DUim2W9fGGyJhTTUfD6UV")
            },
            "type": String("transfer")
        },
        stack_height: None
        }
         */
        if let Some(info) = parsed_inst.parsed.as_object().unwrap().get("info"){
            
            let sender = info.get("source").unwrap().to_string().trim_matches('"').to_string();
            let program =parsed_inst.program.trim_matches('"').to_string();
            let program_id = parsed_inst.program_id.trim_matches('"').to_string();
            let recipient = info.get("destination").unwrap().to_string().trim_matches('"').to_string();
            let lamports_sol = info.get("lamports").unwrap().to_string().trim_matches('"').to_string();
            let amount = lamports_sol.parse::<f64>().unwrap() / solana_sdk::native_token::LAMPORTS_PER_SOL as f64;
            //let tokenAmount = serde_json::from_str(&info.get("tokenAmount").unwrap().to_string());
            
            //println!("{}",parsed_inst.parsed.as_object().unwrap().get("info").unwrap());
            //let json_value = serde_json::from_str(&info.get("tokenAmount").unwrap().to_string()).unwrap();
            /*
            let json_value = info.get("tokenAmount").unwrap();
            let amount = json_value["uiAmount"].to_string().trim_matches('"').to_string();
            
            
            

            let mintname = self.get_token_name(&mint_token);
 */
            let datetimeu=tx.block_time.unwrap().to_string().trim_matches('"').to_string().parse::<u64>().unwrap();
            let datetimes: chrono::DateTime<chrono::Utc> = chrono::Utc.from_utc_datetime(&NaiveDateTime::from_timestamp(datetimeu as i64, 0));
            let formatted_datetime = datetimes.format("%Y-%m-%d %H:%M:%S").to_string();
            let trans = serde_json::json!({
                "datetime":formatted_datetime,
                "sender":sender,
                "authority":sender,
                "recipient":recipient,
                "amount":amount,
                "minttoken":"",
                "mintname":"sol"
            });
            QuickLogger::Warn(&format!("parse_transfer json: {:?}",trans.to_string()));

            return Some(trans);
            
        }
        None
    }
    
    fn parse_transfer_checked(&self,tx:&EncodedConfirmedTransactionWithStatusMeta,parsed_inst:&ParsedInstruction)->Option<serde_json::Value>{
        
            /*
             * {"authority":"BkE3LmTwWRFDjpTvYz9zNCaYJSkKPdZRGTVoEvg4ikiJ",
             * "destination":"BrgMGsGz4aekxpF4AxrfK8YevUKx7e5GbeU8NUFxbVwS",
             * "mint":"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
             * "source":"wLT8aYjvR23RYpPHxPFdA49fNByafNauxLocraHE3u3",
             * "tokenAmount":{"amount":"28000000","decimals":6,"uiAmount":28.0,"uiAmountString":"28"}}
             */
            
            if let Some(info) = parsed_inst.parsed.as_object().unwrap().get("info"){
               
                let sender = info.get("source").unwrap().to_string().trim_matches('"').to_string();
                let sender_authority =info.get("authority").unwrap().to_string().trim_matches('"').to_string();
                let mint_token = info.get("mint").unwrap().to_string().trim_matches('"').to_string();
                let recipient = info.get("destination").unwrap().to_string().trim_matches('"').to_string();
                //let tokenAmount = serde_json::from_str(&info.get("tokenAmount").unwrap().to_string());
                
                //println!("{}",parsed_inst.parsed.as_object().unwrap().get("info").unwrap());
                //let json_value = serde_json::from_str(&info.get("tokenAmount").unwrap().to_string()).unwrap();
                let json_value = info.get("tokenAmount").unwrap();
                let amount = json_value["uiAmount"].to_string().trim_matches('"').to_string();
                let datetimeu=tx.block_time.unwrap().to_string().trim_matches('"').to_string().parse::<u64>().unwrap();
                let datetimes: chrono::DateTime<chrono::Utc> = chrono::Utc.from_utc_datetime(&NaiveDateTime::from_timestamp(datetimeu as i64, 0));
                let formatted_datetime = datetimes.format("%Y-%m-%d %H:%M:%S").to_string();

                let mintname = self.get_token_name(&mint_token);

                let trans = serde_json::json!({
                    "datetime":formatted_datetime,
                    "sender":sender,
                    "authority":sender_authority,
                    "recipient":recipient,
                    "amount":amount,
                    "minttoken":mint_token,
                    "mintname":mintname
                });
                return Some(trans)
                //QuickLogger::Warn(&format!("json: {:?}",json_trans.clone().to_string()));

            }
            None
        }
    
    
    pub fn get_transactions(&self,public_key:&Pubkey,limit:usize) -> Option<serde_json::Value>{
        let config = GetConfirmedSignaturesForAddress2Config::default();
        let mut json_trans = serde_json::json!([]);
        
        QuickLogger::Warn(&format!("get_transactions pubkey:{}",public_key.to_string()));
  
            //let mut transactions = Vec::new();
            // Fetch the parsed transactions for each signature
            //QuickLogger::Warn(&format!("signatures: {:?}",0));
            let signatures = self.client.get_signatures_for_address_with_config(&public_key, config);
            //QuickLogger::Warn(&format!("signatures: {:?}",signatures));
            for signature_info in signatures.unwrap().iter().take(limit) {
                //QuickLogger::Warn(&format!("transaction: {:?}",1));
                let signature = solana_sdk::signature::Signature::from_str(&signature_info.signature).unwrap();
                let transaction = self.client.get_transaction(&signature, UiTransactionEncoding::JsonParsed);
                //QuickLogger::Warn(&format!("transaction: {:?}",2));
                match transaction {
                    Ok(tx) => {
                        
                        let trans_tx = tx.transaction.clone();
                        //let meta = trans_tx.meta.clone();
                        let blocktime  = tx.block_time.unwrap();
                        match trans_tx.transaction{
                            solana_transaction_status::EncodedTransaction::LegacyBinary(_) => todo!(),
                            solana_transaction_status::EncodedTransaction::Binary(_, _) => todo!(),
                            solana_transaction_status::EncodedTransaction::Json(ui_trans) => {
                                match ui_trans.message{
                                    solana_transaction_status::UiMessage::Parsed(message) => {
                                        //QuickLogger::Warn(&format!("Parsed->message: {:?}",message));
                                        for instruction in message.instructions {
                                            match instruction{
                                                solana_transaction_status::UiInstruction::Compiled(_) => todo!(),
                                                solana_transaction_status::UiInstruction::Parsed(inst) => {
                                                    match inst{
                                                        solana_transaction_status::UiParsedInstruction::Parsed(parsed_inst) => {
                                                            //let program_id = parsed_inst.program_id;
                                                           // QuickLogger::Warn(&format!("pid: {:?}\r\n",pid));      
                                                            parsed_inst.parsed.as_object().unwrap().iter().for_each(|(key,value)|{
                                                                if key=="type" && value=="transferChecked"{
                                                                    /*
                                                                     * {"authority":"BkE3LmTwWRFDjpTvYz9zNCaYJSkKPdZRGTVoEvg4ikiJ",
                                                                     * "destination":"BrgMGsGz4aekxpF4AxrfK8YevUKx7e5GbeU8NUFxbVwS",
                                                                     * "mint":"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                                                                     * "source":"wLT8aYjvR23RYpPHxPFdA49fNByafNauxLocraHE3u3",
                                                                     * "tokenAmount":{"amount":"28000000","decimals":6,"uiAmount":28.0,"uiAmountString":"28"}}
                                                                     */
                                                                    
                                                                    if let Some(_) = parsed_inst.parsed.as_object().unwrap().get("info"){
                                                                        let trans =self.parse_transfer_checked(&tx,&parsed_inst).unwrap();
                                                                        json_trans.as_array_mut().unwrap().push(trans);
                                                                        //QuickLogger::Warn(&format!("json: {:?}",json_trans.clone().to_string()));

                                                                    }

                                                                }
                                                                
                                                                if key=="type" && value=="transfer"{
                                                                    if let Some(_) = parsed_inst.parsed.as_object().unwrap().get("info"){
                                                                        let trans =self.parse_transfer(&tx,&parsed_inst).unwrap();
                                                                        json_trans.as_array_mut().unwrap().push(trans);
                                                                        //QuickLogger::Warn(&format!("json: {:?}",json_trans.clone().to_string()));

                                                                    }
                                                                }
                                                            });
                                                              
                                                        },
                                                        solana_transaction_status::UiParsedInstruction::PartiallyDecoded(ui_part_decode) => {
                                                            //QuickLogger::Warn(&format!("Partially Decoded: {:?}\r\n",ui_part_decode));
                                                        },
                                                   
    
                                                    };
                                                    
                                                },
                                            };
                                        }
                                    },
                                    solana_transaction_status::UiMessage::Raw(_) => {},
                                }
                            },
                            solana_transaction_status::EncodedTransaction::Accounts(_) => todo!(),
                        };
  
                    },
                    Err(e) => println!("Error fetching transaction: {:?}", e),
                    
                }
                
            }
    
            // Process transactions here as needed
            
            Some(json_trans)
      
    }
    pub fn get_account_crypto(&self,pubkey:&Pubkey){
        QuickLogger::Warn(&format!("get_account_crypto: {:?}",pubkey));
        QuickLogger::Warn(&format!("pubk1: {:?},pubk2:{:?}",spl_token::native_mint::id(),spl_token::id()));
        let mints = self.client.get_token_accounts_by_owner(pubkey,solana_client::rpc_request::TokenAccountsFilter::ProgramId(spl_token::id()) );
        match mints{
            Ok(mints) => {
                QuickLogger::Warn(&format!("mints: {:?}",mints));
                for mint in mints.iter(){
                    let mint = mint.clone();
                    /*
                    let mint_pubkey = mint.account.data.decode().
                    let balance = mint.account.data.parsed.info.token_amount.ui_amount;
                    let mint_name = self.get_token_name(&mint_pubkey.to_string());
                     */
                    QuickLogger::Warn(&format!("mint: {:?}",mint));
                   // QuickLogger::Warn(&format!("mint: {:?}, balance: {:?}, mint_name: {:?}",mint_pubkey,balance,mint_name));
                }
            },
            Err(e) => {
                QuickLogger::Error(&format!("get mint error: {:?}",e));
            }
        
        }
    }
}
fn lamports_to_sol(lamports: u64) -> f64 {
    lamports as f64 / 1_000_000_000.0
}