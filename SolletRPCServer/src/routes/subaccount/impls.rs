use actix_web::{delete, get, post, put, web, HttpRequest, HttpResponse, Responder};
use chrono::Utc;
use crate::{db::{account::message::FetchAccount, subaccount::message::{DelSubAccountMsg, FetchSubAccountsMsg, InsSubAccount, UpdateSubAccountMsg}}, jwt};
use dbengine::utils::DbState;
use log::{info, warn};
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
    }
    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("SubAccount save failed!",&name.clone(),"")});
 
}

#[get("/{token}")]
async fn read_subaccounts(path:web::Path<String>,state:web::Data<DbState>,req:HttpRequest)->impl Responder{
    let token = path.into_inner();

    if let Some(user_claim) = jwt::token_decode(&token){
        info!("read_subaccounts:{:#?}",user_claim);
        let owner = user_claim.pkey;
        let db = state.as_ref().db.clone();
        match db.send(FetchSubAccountsMsg{
            owner:owner.clone(),
        }).await{
            Ok(res) => {
                let accounts = res.unwrap();
                //info!{"All SubAccounts:{:#?}",accounts};
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str(), data:serde_json::to_value(accounts).unwrap()});
             },
            Err(_) => { 
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("No subaccount!","","")});
             },
        }
    }
    
    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("No subaccount!","","")});
}

#[get("/{pk}/{token}")]
async fn read_subaccount(data:web::Path<(String,String)>,req:HttpRequest)->impl Responder{
    info!("read_subaccount:{:#?}",data);
    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str(),data:make_reg_reponse_json("Account not exist","","")});
}

#[put("/{name}/{pk}/{token}")]
async fn update_subaccount(data:web::Path<(String,String,String)>,state:web::Data<DbState>,req:HttpRequest)->impl Responder{
    info!("update_subaccount:{:#?}",data);
    let (newname,privatekey,token)=data.into_inner();
    let db = state.as_ref().db.clone();

    if let Some(user_claim) = jwt::token_decode(&token){
        let owner = user_claim.pkey.clone();
        match db.send(UpdateSubAccountMsg{owner:owner.clone(),privatekey:privatekey.clone(),account:json!({})}).await{
            Ok(_) => {
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str(),data:make_reg_reponse_json("Delete successfully!","","")});
            },
            Err(_) => {
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Delete failed!","","")});
            },
        }
    }

    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Delete failed!","","")});
}

#[delete("/{pk}/{token}")]
async fn delete_subaccount(data:web::Path<(String,String)>,state:web::Data<DbState>,req:HttpRequest)->impl Responder{
    warn!("delete_subaccount:{:#?}",data);
    let (privatekey,token)=data.into_inner();
    let db = state.as_ref().db.clone();

    if let Some(user_claim) = jwt::token_decode(&token){
        let owner = user_claim.pkey.clone();
        match db.send(DelSubAccountMsg{owner:owner.clone(),privatekey:privatekey.clone()}).await{
            Ok(_) => {
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::OK.str(),data:make_reg_reponse_json("Delete successfully!","","")});
            },
            Err(_) => {
                return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Delete failed!","","")});
            },
        }
    }

    return HttpResponse::Ok().json(RepStatus { status:ResponseStatus::ERROR.str(),data:make_reg_reponse_json("Delete failed!","","")});
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