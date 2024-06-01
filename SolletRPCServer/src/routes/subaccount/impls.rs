use actix_web::{delete, get, post, put, web, HttpRequest, HttpResponse, Responder};
use chrono::Utc;
use crate::{db::{account::message::FetchAccount, subaccount::message::{FetchSubAccount, InsSubAccount}}, jwt};
use dbengine::utils::DbState;
use log::info;
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{common::{make_reg_reponse_json, ResponseStatus}, db::subaccount::models::SubAccount, status::RepStatus};

#[derive(Clone,Debug,Deserialize)]
pub struct SubAccountReq{
    pub phrase:String,
    pub name:String,
    pub privatekey:String,
    pub token:String,
}


#[post("/create")]
async fn create_subaccount(data:web::Json<SubAccountReq>,state:web::Data<DbState>,req:HttpRequest)->impl Responder{
    let token = data.token.clone();
    let name = data.name.clone();
    let phrase = data.phrase.clone();
    let privatekey = data.privatekey.clone();
    
    info!("create_subaccount:{:#?}",data);
    if let Some(owner_info) = jwt::token_decode(&token){
        let owner = owner_info.pkey;
        let db = state.as_ref().db.clone();
        let accountjsonb = json!({"name":name.clone(),"phrase":phrase.clone(),"privatekey":privatekey.clone()});
        match db.send(InsSubAccount{account:accountjsonb.clone(),owner:owner.clone(),create_time:Utc::now(),privatekey:privatekey.clone()}).await{
            Ok(_) => {
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str(),data:make_reg_reponse_json("SubAccount saved!",&name.clone(),"")});
            },
            Err(_) => {
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("SubAccount save failed!",&name.clone(),"")});
            },
        };
            
       
    }else{

    }

    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("SubAccount  exist","","")});
}

#[get("/{owner}/{token}")]
async fn read_subaccounts(path:web::Path<(String,String)>,state:web::Data<DbState>,req:HttpRequest)->impl Responder{
    let (owner,_token) = path.into_inner();
    info!("path:{} - {}",owner,_token);
    let db = state.as_ref().db.clone();
    match db.send(FetchSubAccount{
        owner:owner.clone(),
    }).await{
        Ok(res) => {
            let accounts = res.unwrap();
            //info!{"All SubAccounts:{:#?}",accounts};
            return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str(), data:serde_json::to_value(accounts).unwrap()});
            /*
            for item in res{
                let account = item.account;
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str(), data:accounts});
            } */
         },
        Err(_) => {  },
    }
    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Account not exist","","")});
}

#[get("/{owner}/{pk}/{token}")]
async fn read_subaccount(data:web::Path<(String,String,String)>,req:HttpRequest)->impl Responder{
    info!("read_subaccount:{:#?}",data);
    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str(),data:make_reg_reponse_json("Account not exist","","")});
}

#[put("/{owner}/{pk}/{token}")]
async fn update_subaccount(data:web::Path<(String,String)>,req:HttpRequest)->impl Responder{
    info!("update_subaccount:{:#?}",data);
    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str(),data:make_reg_reponse_json("Account not exist","","")});
}

#[delete("/{owner}/{pk}/{token}")]
async fn delete_subaccount(data:web::Path<(String,String)>,req:HttpRequest)->impl Responder{
    info!("delete_subaccount:{:#?}",data);
    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str(),data:make_reg_reponse_json("Account not exist","","")});
}

pub fn subaccount_routes(cfg:&mut web::ServiceConfig){
    let route_path="/subaccount";

    cfg.service(
    web::scope(route_path)
            .service(read_subaccounts)
            .service(read_subaccount)
            .service(update_subaccount)
            .service(delete_subaccount)
            .service(create_subaccount)
           //.route("/save", web::post().to(save_subaccount))
    );

}