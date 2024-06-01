

use std::{env, sync::{Arc, Mutex}, time::Duration};
use actix::clock::Interval;
use actix_extensible_rate_limit::{backend::{memory::InMemoryBackend, SimpleInputFunctionBuilder}, RateLimiter};
use log::{ debug, error, info, trace, warn, Level, Record};
use chrono::Utc;
use dbengine::utils::{DbState, PGPool};


use diesel::sql_types::Bool;
use serde_json::json;
use actix_rt::task;
use actix_web::{ cookie::{Cookie, SameSite}, post, web, HttpRequest, HttpResponse, Responder};
use serde::Deserialize;
use solana_client::client_error::reqwest::Request;
use solana_sdk::signer::Signer;
use crate::{common::{get_remote_ip, make_reg_reponse_json, CryptClients, ResponseStatus}, db::{account::message::{EstablishAccount, FetchAccount, UpdateLoginMsg}, schema::account::login_time}, jwt::{get_exp, get_jwt_secret, token_decode, UserClaims}, status::RepStatus};

#[derive(Clone,Deserialize,Debug)]
struct AirData{
    info:String,
    token:String
}
#[derive(Deserialize,Debug,Clone)]
struct QueryBalance{
    phrase:String,
    token:String
}
#[derive(Deserialize,Debug,Clone)]
struct RegisterRequest{
    phrase:String,
    privatekey:String,
    username:String,
}
#[derive(Deserialize,Debug,Clone)]
struct LoginRequest{
    phrase:String,
    privatekey:String,
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



#[post("/balance")]
async fn balance(crypt_client:web::Data<Arc<Mutex<CryptClients>>>,data:web::Json<QueryBalance>,req:HttpRequest)->impl Responder{
     let response:RepStatus;
     let phrase = data.phrase.to_string();
     /*
     let mut seed:&[u8];
     if  seed = check_parse(&mnemonic_phrase)==None{

     } */

    info!("balance req: {:#?}",data);
    let token = data.token.clone();
    
    if let Some(claims) = token_decode(&token){
        info!("balance {}\r\n,{}",claims.name,claims.ip);
    }else{
        info!("balance error");
    }



    if check_parse(&phrase)=="".to_string(){
        response = RepStatus { status:ResponseStatus::ERROR.str(),data:json!({})};
        error!("get balance recovery phrase error: {}",phrase);
        return HttpResponse::NotFound().json(response);
    }
 
    

    let balance_result = task::spawn_blocking(move || {
        let account_pubkey = coins::generate_solana_public_key(&phrase).unwrap();
        crypt_client.clone().lock().unwrap().solana.get_balance(&account_pubkey.try_pubkey().unwrap())
    }).await;

    
    match balance_result {
        Ok(balance) => {
            response = RepStatus { status:ResponseStatus::OK.str(),data:json!({"balance":balance.unwrap()})};
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            response = RepStatus { status:ResponseStatus::FAILED.str() ,data:json!({})};
            error!("get balance error: {:?}",e);
            HttpResponse::BadRequest().json(response)
            
        },
    }
    
}

#[post("/register")]
async fn register(data:web::Json<RegisterRequest>,state:web::Data<DbState>,req:HttpRequest)->impl Responder{
    let db = state.get_ref().db.clone();
    let remote_ip = get_remote_ip(&req).unwrap();
    warn!("register account :{:#?}",& data);
    if data.username.trim()=="" || data.privatekey.trim()=="" || data.phrase.trim()==""{
        QuickLogger::Error(&"register error".to_string());
        return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Invalid input data","","")});
    }

    match db.send(EstablishAccount{
        name:data.username.clone(),
        privatekey:data.privatekey.clone(),
        phrase:Some(data.phrase.clone()),
        create_time:chrono::Utc::now(),
        modify_time:chrono::Utc::now(),
        create_ip:remote_ip.clone(),
    }).await{
        Ok(result)=>{
            if let Ok(record) = result{
                warn!("register success! :{}",&record.name.clone());
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str().to_string() ,data:make_reg_reponse_json("Register account successfully!", &record.name.clone(),"")})
            }else{
                QuickLogger::Warn(&"register->failed!".to_string());
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Register account failed!","","")});
            }
        },
        Err(e)=>{
            error!("register error:{}",e);
            return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Register account failed!","","")});
        }
    }

}


#[post("/login")]
async fn login(data:web::Json<LoginRequest>,state:web::Data<DbState>,req:HttpRequest)->impl Responder{
    let db = state.as_ref().db.clone();
    let phrase_clone = data.phrase.trim().to_string();
    let privkey_clone = data.privatekey.trim().to_string();
    let remote_ip = get_remote_ip(&req).unwrap();
    let mut token:String="".to_string();
    let mut privkey:String=privkey_clone.clone();

    warn!("login fields :{:#?}",& data);
    if phrase_clone=="" && privkey_clone==""{
        QuickLogger::Error(&"login error".to_string());
        return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Invalid input data","","")});
    }
    if privkey_clone.trim()==""{
        privkey = coins::generate_solana_private_key(&phrase_clone).unwrap_or_else(||{
            warn!("login privkey");
            "".to_string()
        });
    }

    match db.send(FetchAccount{privatekey:privkey.clone()}).await{
        Ok(result)=>{
            if let Ok(record) = result{
                //update ip
                match db.send(UpdateLoginMsg{
                                            name:"".to_string(),
                                            privatekey:privkey.clone(),
                                            login_time:Some(Utc::now()),
                                            login_ip:Some(get_remote_ip(&req).unwrap()),
                                            }).await{
                    Ok(update_result)=>{
                        let record = update_result.unwrap();

                        let mut user = UserClaims::new( &record.name.clone(),&privkey,&remote_ip,&vec![]);
                        token = user.get_token();
                       
                        warn!("login session:{:#?}",user);
                    },
                    Err(e)=>{
                        error!("login update error:{}",e);
                    }
                };

                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str() ,data:make_reg_reponse_json("login successfully!", &record[0].name.clone(),&token.clone())})
            }else{
                warn!("login->user not found!");
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Account not exist","","")});
            }
        },
        Err(e)=>{
            error!("login error:{}",e);
            return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Account not exist","","")});
        }

    }
    
    
}


#[post("/rttransfer")]
async fn rttransfer(crypt_client:web::Data<Arc<Mutex<CryptClients>>>,req:web::Json<QueryBalance>)->impl Responder{
    let response:RepStatus;
    let mnemonic_phrase = req.phrase.to_string();
    if check_parse(&mnemonic_phrase)=="".to_string(){
        response = RepStatus { status:ResponseStatus::ERROR.str(),data:json!({})};
        error!("get rttransfer recovery phrase error: {}",mnemonic_phrase);
        return HttpResponse::NotFound().json(response);
    }
    //warn!("rttransfer phrase :{}",mnemonic_phrase));

    
    let json_trans=task::spawn_blocking(move||{
        let public_key=coins::generate_solana_public_key(&mnemonic_phrase).unwrap().try_pubkey().unwrap();
        //crypt_client.solana.get_account_crypto(&public_key);
        //let pubk=Pubkey::from_str("273pPaNDA8CqUb46fevr2B3DUim2W9fGGyJhTTUfD6UV").unwrap();
        crypt_client.clone().lock().unwrap().solana.get_transactions(&public_key,10)
    }).await.unwrap();
    
    response = RepStatus { status:ResponseStatus::OK.str(),data:json_trans.unwrap()};
    HttpResponse::Ok().json(response)
    
}
#[post("/airdrop")]
async fn airdrop(data:web::Json<AirData>,req:HttpRequest)->impl Responder{
    info!("airdrop req: {:#?}",data);
    let auth_header = req.headers().get("Authorization").and_then(|h| h.to_str().ok());
    if let Some(token) = auth_header.and_then(|h| h.strip_prefix("Bearer ")) {
        if let Some(claims) = token_decode(token){
            info!("airdrop1 {:#?}\r\n,{:#?}",claims.name,data.token);
        }else{
            info!("airdrop2 error");
        }
       
    } 
    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Account not exist","","")});
  
}

pub fn account_routes(cfg:&mut web::ServiceConfig){
    let api_path="/account/api";

    cfg.service(
    web::scope(api_path)
            .service(balance)
            .service(airdrop)
            .service(login)
            .service(register)
            .service(rttransfer)

            
            
    );

}