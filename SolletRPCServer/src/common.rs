use actix_web::{http::header, HttpRequest};
use coins::SolanaCoin;
use serde_json::{json, Value};
use solana_client::rpc_client::RpcClient;

pub struct CryptClients{
    pub solana:SolanaCoin,
    pub eth:SolanaCoin,
    pub poly:SolanaCoin
}
#[allow(non_snake_case)]
pub enum ResponseStatus{
    OK,
    FAILED,
    ERROR,
    TIMEOUT,
}

impl ResponseStatus{
    pub fn str(&self)->String{
        match self{
            ResponseStatus::OK=>"OK".to_string(),
            ResponseStatus::FAILED=>"FAILED".to_string(),
            ResponseStatus::TIMEOUT=>"TIMEOUT".to_string(),
            ResponseStatus::ERROR=>"ERROR".to_string()
        }
        
    }
}

pub fn make_reg_reponse_json(msg:&str,username:&str,token:&str)->Value{
    json!({"info":format!("{}",msg),"username":username,"token":token})
}


pub fn get_remote_ip(req: &HttpRequest) -> Option<String> {
    // get from X-Forwarded-For remote IP
    if let Some(forwarded) = req.headers().get(header::FORWARDED) {
        if let Ok(forwarded_str) = forwarded.to_str() {
            if let Some(ip) = forwarded_str.split(',').next() {
                return Some(ip.trim().to_string());
            }
        }
    }

    // if not X-Forwarded-For head，else from request IP
    if let Some(peer_addr) = req.peer_addr() {
        return Some(peer_addr.ip().to_string());
    }

    None
}