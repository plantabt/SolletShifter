

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
use solana_sdk::signer::Signer;
use crate::{common::{get_remote_ip, make_reg_reponse_json, CryptClients, ResponseStatus}, db::{account::message::{EstablishAccount, FetchAccount, UpdateLoginMsg}, schema::account::login_time}, jwt::{get_exp, UserClaims}, model::Status};

#[derive(Clone,Deserialize)]
struct AirData{
    info:String
}
#[derive(Deserialize,Debug,Clone)]
struct QueryBalance{
    phrase:String,
    privekey:String
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
async fn rttransfer(crypt_client:web::Data<Arc<Mutex<CryptClients>>>,req:web::Json<QueryBalance>)->impl Responder{
    let response:Status;
    let mnemonic_phrase = req.phrase.to_string();
    if check_parse(&mnemonic_phrase)=="".to_string(){
        response = Status { status:ResponseStatus::ERROR.str(),data:json!({})};
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
    
    response = Status { status:ResponseStatus::OK.str(),data:json_trans.unwrap()};
    HttpResponse::Ok().json(response)
    
}
#[post("/balance")]
async fn balance(crypt_client:web::Data<Arc<Mutex<CryptClients>>>,req:web::Json<QueryBalance>)->impl Responder{
     let response:Status;
     let mnemonic_phrase = req.phrase.to_string();
     /*
     let mut seed:&[u8];
     if  seed = check_parse(&mnemonic_phrase)==None{

     } */
    if check_parse(&mnemonic_phrase)=="".to_string(){
        response = Status { status:ResponseStatus::ERROR.str(),data:json!({})};
        error!("get balance recovery phrase error: {}",mnemonic_phrase);
        return HttpResponse::NotFound().json(response);
    }
 
    

    let balance_result = task::spawn_blocking(move || {
        let account_pubkey = coins::generate_solana_public_key(&mnemonic_phrase).unwrap();
        crypt_client.clone().lock().unwrap().solana.get_balance(&account_pubkey.try_pubkey().unwrap())
    }).await;

    
    match balance_result {
        Ok(balance) => {
            response = Status { status:ResponseStatus::OK.str(),data:json!({"balance":balance.unwrap()})};
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            response = Status { status:ResponseStatus::FAILED.str() ,data:json!({})};
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
        return HttpResponse::Ok().json(Status { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Invalid input data","","")});
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
                return HttpResponse::Ok().json(Status { status:ResponseStatus::OK.str().to_string() ,data:make_reg_reponse_json("Register account successfully!", &record.name.clone(),"")})
            }else{
                QuickLogger::Warn(&"register->failed!".to_string());
                return HttpResponse::Ok().json(Status { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Register account failed!","","")});
            }
        },
        Err(e)=>{
            error!("register error:{}",e);
            return HttpResponse::Ok().json(Status { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Register account failed!","","")});
        }
    }
    
    /*
    let result = web::block(move||{
        dbengine::create_account(&db_pool,&data.username,&data.privatekey.to_string(),&data.phrase.to_string(),&remote_ip)
    }).await;
     */
    /*
    let result = dbengine::create_account(&db_pool,&data.username,&data.privatekey.to_string(),&data.phrase.to_string(),&remote_ip).await;
    match result{
        Ok(_)=>{
            
            HttpResponse::Ok().json(Status { status:ResponseStatus::OK.str() ,data:make_reg_reponse_json(&"Register account successfully!",&username_clone)})
        },
        Err(_)=>{
            return HttpResponse::Ok().json(Status { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json(&"Register account failed!",&username_clone)});
        }
    } 
     */
   // HttpResponse::Ok().json(Status { status:ResponseStatus::OK.str() ,data:make_reg_reponse_json(&"Register account successfully!",&username_clone)})
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
        return HttpResponse::Ok().json(Status { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Invalid input data","","")});
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

                return HttpResponse::Ok().json(Status { status:ResponseStatus::OK.str() ,data:make_reg_reponse_json("login successfully!", &record[0].name.clone(),&token.clone())})
            }else{
                QuickLogger::Warn(&"login->user not found!".to_string());
                return HttpResponse::Ok().json(Status { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Account not exist","","")});
            }
        },
        Err(e)=>{
            error!("login error:{}",e);
            return HttpResponse::Ok().json(Status { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Account not exist","","")});
        }

    }
    /*
    let remote_ip = get_remote_ip(&req).unwrap();
    let phrase_clone = data.phrase.trim().to_string();
    let privkey_clone = data.privatekey.trim().to_string();
    let mut privkey:String="".to_string();
    warn!("login fields :{:#?}",& data));
    if phrase_clone=="" && privkey_clone==""{
        QuickLogger::Error(&"login error".to_string());
        return HttpResponse::Ok().json(Status { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Invalid input data","")});
    }
    if privkey_clone.trim()==""{
        privkey = coins::generate_solana_private_key(&phrase_clone).unwrap_or_else(||{
            warn!("login privkey"));
            "".to_string()
        });
    }

    warn!("search privkey"));
    if let Some(account)=dbengine::is_account_exist(&db_pool,&privkey).await{
        warn!("search :{:#?}",account));
        return HttpResponse::Ok().json(Status { status:"Ok".to_string() ,data:make_reg_reponse_json("login success!", &account.username)})
    }else{
        return HttpResponse::Ok().json(Status { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Account not exist","")});
    }
    */
   // return HttpResponse::Ok().json(Status { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Account not exist","")});
    
}

#[post("/airdrop")]
async fn airdrop(data:web::Json<AirData>)->impl Responder{
    info!("post:/api/airdrop:{}",data.info);
    HttpResponse::Ok().json(Status { status:"Ok".to_string() ,data:json!({})})
}

pub fn account_config(cfg:&mut web::ServiceConfig){
    let api_path="/account/api";

    cfg.service(
    web::scope(api_path)
            .service(balance)
            .service(airdrop)
            .service(rttransfer)
            .service(login)
            .service(register)

            
            
    );

}