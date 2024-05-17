mod model;
mod common;
mod apis;
use std::{io, sync::Arc, time};


use actix_cors::Cors;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

use apis::account::apis::{account_config};
use coins::SolanaCoin;
use common::CryptClients;
use model::Status;
use serde::{Deserialize, Serialize};
use solana_client::rpc_client::RpcClient;



#[derive(Clone,Serialize,Debug)]
struct TestData{

    info:String
}




#[get("/api/test")]
async fn test(data:web::Data<TestData>)->impl Responder{
    QuickLogger::Info(&"api/test".to_string());
    QuickLogger::Info(&format!("{:?}",data));
    HttpResponse::Ok().json(Status{status:"test".to_string(),data:data.info.to_string()})
}
#[derive(Serialize,Deserialize)]
struct ServerConfig {
    server: String,
    port:String,
    solana:String,
    eth:String,
    poly:String
}
#[actix_web::main]
async fn main()->io::Result<()> {
    let package_name = env!("CARGO_PKG_NAME");
    let package_version = env!("CARGO_PKG_VERSION");
    QuickLogger::init();

    let server_cfg :ServerConfig= Config::ReadCfg().unwrap();

    /*
    let scfg = ServerConfig{
        server:"1.1.1.1".to_string(),
        port:"1111".to_string()
    };
    Config::WriteCfg(scfg);
    */

    QuickLogger::Warn(&format!("************** {} v{} ****************",package_name,package_version));
    QuickLogger::Warn(&format!("***************** {}:{} *******************",server_cfg.server,server_cfg.port));

    let solana = SolanaCoin::new(&server_cfg.solana.clone());
    let eth = SolanaCoin::new(&server_cfg.eth.clone());
    let poly = SolanaCoin::new(&server_cfg.poly.clone());

    QuickLogger::Warn(&format!("SOLANA:{:?}",server_cfg.solana.clone()));
    QuickLogger::Warn(&format!("ETH:{}",server_cfg.eth.clone()));
    QuickLogger::Warn(&format!("POLY:{}",server_cfg.poly.clone()));

    let encrypt_clients = Arc::new(CryptClients{solana,eth,poly});
    HttpServer::new(move||{
        let cors = Cors::permissive();  // 创建一个允许所有来源的 CORS 实例
        App::new()
        .wrap(cors)
        .app_data(web::Data::new(encrypt_clients.clone()))
        .service(test)
        .configure(account_config)
    }).bind(format!("{}:{}",server_cfg.server,server_cfg.port))?.run().await
}
