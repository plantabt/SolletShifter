use std::{str::FromStr, sync::Arc};

use actix_rt::task;
use actix_web::{self, get, post, web::{self, Json}, HttpResponse, Responder};
use bip39::{Language, Mnemonic};
use serde::Deserialize;

use solana_sdk::{signature::Keypair, signer::{SeedDerivable, Signer}};


use crate::{common::{CryptClients,  ResponseStatus}, model::Status};
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
    match Mnemonic::parse(instr){
        Ok(mnemonic)=>{
            mnemonic.to_string()
        },
        Err(_)=>{
            "".to_string()
        }
    }
    
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
    let seed = Mnemonic::parse(mnemonic_phrase).unwrap().to_seed("");
    let solana_keypair = Keypair::from_seed(&seed).expect("Failed to create keypair from seed slice");

    let account_pubkey = solana_keypair.pubkey();

    let balance_result = task::spawn_blocking(move || {
        crypt_client.solana.get_balance(&account_pubkey)
    }).await;

    
    match balance_result {
        Ok(balance) => {
            response = Status { status:ResponseStatus::OK.str(),data:format!("{}",lamports_to_sol(balance.unwrap()))};
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            response = Status { status:ResponseStatus::FAILED.str() ,data:"account balance".to_string()};
            QuickLogger::Error(&format!("get balance error: {:?}",e));
            HttpResponse::BadRequest().json(response)
            
        },
    }
    
}

fn lamports_to_sol(lamports: u64) -> f64 {
    lamports as f64 / 1_000_000_000.0
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
    );
}