use std::{env, sync::Mutex, time::{SystemTime, UNIX_EPOCH}};
use actix_web::Error;
use bip32::secp256k1::elliptic_curve::bigint::Encoding;
use log::error;
use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};

#[derive(Clone,Serialize,Deserialize,Debug)]
pub struct UserClaims{
    pub name:String,
    pub ip:String,
    pub pkey:String,
    pub role:Vec<String>,
    pub exp:u64,
}

impl UserClaims{
    pub fn new(name:&String,pkey:&String,ip:&String,role:&Vec<String>)->UserClaims{
        let mut user = UserClaims{
            name:name.clone(),
            pkey:pkey.clone(),
            ip:ip.clone(),
            role:role.clone(),
            exp:0
        };
        user.set_exp(get_exp());
        user
    }

    pub fn get_token(&mut self)->String{
        let secret = format!("{}{}",get_jwt_secret(),get_jwt_salt());
        encode(&Header::default(), &self, &EncodingKey::from_secret(secret.as_ref())).unwrap()
    }
    pub fn set_exp(&mut self,exp:u64){
        let expiration = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() + exp; 
        self.exp = expiration;
    }
    
}

pub fn get_jwt_salt()->String{
    env::var("JWT_SECRET").unwrap()
}
pub fn get_jwt_secret()->String{
    env::var("JWT_SALT").unwrap()
}
pub fn get_exp()->u64{
    env::var("JWT_EXPIRATION").unwrap().parse::<u64>().unwrap()
}

pub fn token_decode(token:&str)->Option<UserClaims>{
    let dekey = DecodingKey::from_secret(format!("{}{}",get_jwt_secret(),get_jwt_salt()).as_bytes());
    match decode::<UserClaims>(token,&dekey, &Validation::default()){
        Ok(token_data) => {
            return Some(token_data.claims)
        },
        Err(e) => {
            error!("token_decode error: {:#?}",e);
        },
    }
    None
}
 