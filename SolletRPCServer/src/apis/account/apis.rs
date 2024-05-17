

use std::{io::{Cursor, Read, Write}, path::Path, ptr::{null, null_mut}, str::FromStr, string, sync::Arc};



use anchor_lang::{AccountDeserialize, AnchorDeserialize, AnchorSerialize};
use chrono::{NaiveDateTime, TimeZone};
use hmac::{Hmac, Mac};
use sha2::Sha512;

use borsh::{BorshDeserialize, BorshSchema};

use actix_rt::task;
use actix_web::{self, get, post, web::{self, Json}, HttpResponse, Responder};
use serde::{Deserialize, Serialize};


use solana_client::{rpc_client::GetConfirmedSignaturesForAddress2Config, rpc_config::{RpcAccountInfoConfig, RpcTransactionConfig}};
use solana_sdk::{account::ReadableAccount, address_lookup_table::instruction, pubkey::Pubkey, signer::Signer};

use crate::{common::{CryptClients,  ResponseStatus}, model::Status};

use solana_sdk::signature::Keypair as Ed25519Keypair;

use solana_transaction_status::{option_serializer::OptionSerializer, UiInnerInstructions, UiTransactionEncoding};
use std::convert::TryInto;
#[derive(Clone,Deserialize)]
struct AirData{
    info:String
}
#[derive(Deserialize,Debug)]
struct QueryBalance{
    phrase:String,
    privekey:String
}
fn check_parse(instr:&String)->String{
    /*
    match Mnemonic::from_phrase(instr,bip39::Language::English){
        Ok(mnemonic)=>{
            mnemonic.to_string()
        },
        Err(_)=>{
            "".to_string()
        }
    }
     */
    instr.to_string()
}
#[derive(Debug)]
struct UiCompiledInstruction {
    program_id_index: usize,
    accounts: Vec<usize>,
    data: String,
    stack_height: Option<u8>,
}

#[derive(Debug)]
enum InstructionWrapper {
    Compiled(UiCompiledInstruction),
    // Assuming there might be other variants
}
fn extract_program_id_index(instruction: InstructionWrapper) -> Option<usize> {
    match instruction {
        InstructionWrapper::Compiled(ui_compiled_instruction) => {
            Some(ui_compiled_instruction.program_id_index)
        },
        // Handle other cases if there are any
        _ => None,
    }
}

//const METAPLEX_METADATA_PROGRAM_ID: &str = "metaqbxxUerdq28cj1RbAWwX9C7Zn4C3JPKWKfXfmcq";



#[post("/rttransfer")]
async fn rttransfer(crypt_client:web::Data<Arc<CryptClients>>,req:web::Json<QueryBalance>)->impl Responder{
    let response:Status;
    let mnemonic_phrase = req.phrase.to_string();
    if check_parse(&mnemonic_phrase)=="".to_string(){
        response = Status { status:ResponseStatus::ERROR.str(),data:format!("{}","")};
        QuickLogger::Error(&format!("get rttransfer recovery phrase error: {}",mnemonic_phrase));
        return HttpResponse::NotFound().json(response);
    }
    //QuickLogger::Warn(&format!("rttransfer phrase :{}",mnemonic_phrase));

    let public_key=coins::generate_solana_public_key(&mnemonic_phrase).unwrap().try_pubkey().unwrap();
    let json_trans=task::spawn_blocking(move||{
        //crypt_client.solana.get_account_crypto(&public_key);
        //let pubk=Pubkey::from_str("273pPaNDA8CqUb46fevr2B3DUim2W9fGGyJhTTUfD6UV").unwrap();
        crypt_client.solana.get_transactions(&public_key,10)
    }).await.unwrap();
    
    response = Status { status:ResponseStatus::OK.str(),data:format!("{}",json_trans.unwrap().to_string())};
    HttpResponse::Ok().json(response)
    
}
#[post("/balance")]
async fn balance(crypt_client:web::Data<Arc<CryptClients>>,req:web::Json<QueryBalance>)->impl Responder{
     let response:Status;
     let mnemonic_phrase = req.phrase.to_string();
     /*
     let mut seed:&[u8];
     if  seed = check_parse(&mnemonic_phrase)==None{

     } */
    if check_parse(&mnemonic_phrase)=="".to_string(){
        response = Status { status:ResponseStatus::ERROR.str(),data:format!("{}","")};
        QuickLogger::Error(&format!("get balance recovery phrase error: {}",mnemonic_phrase));
        return HttpResponse::NotFound().json(response);
    }
 
    let account_pubkey = coins::generate_solana_public_key(&mnemonic_phrase).unwrap();

    let balance_result = task::spawn_blocking(move || {
        
        crypt_client.solana.get_balance(&account_pubkey.try_pubkey().unwrap())
    }).await;

    
    match balance_result {
        Ok(balance) => {
            response = Status { status:ResponseStatus::OK.str(),data:format!("{}",balance.unwrap())};
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            response = Status { status:ResponseStatus::FAILED.str() ,data:"account balance".to_string()};
            QuickLogger::Error(&format!("get balance error: {:?}",e));
            HttpResponse::BadRequest().json(response)
            
        },
    }
    
}



#[post("/airdrop")]
async fn airdrop(data:web::Json<AirData>)->impl Responder{
    QuickLogger::Info(&format!("post:/api/airdrop:{}",data.info));
    HttpResponse::Ok().json(Status { status:"Ok".to_string() ,data:"account airdrop".to_string()})
}

pub fn account_config(cfg:&mut web::ServiceConfig){
    cfg.service(
        web::scope("/account/api")
                    .service(balance)
                    .service(airdrop)
                    .service(rttransfer)
    );
}