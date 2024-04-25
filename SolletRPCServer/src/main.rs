mod model;
mod common;
mod apis;
use std::{io, sync::Arc, time};


use actix_cors::Cors;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

use apis::account::apis::{account_config};
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
    poloy:String
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

    let solana = RpcClient::new(server_cfg.solana);
    let eth = RpcClient::new(server_cfg.eth);
    let poloy = RpcClient::new(server_cfg.poloy);
    let encrypt_clients = Arc::new(CryptClients{solana,eth,poloy});
    HttpServer::new(move||{
        let cors = Cors::permissive();  // 创建一个允许所有来源的 CORS 实例
        App::new()
        .wrap(cors)
        .app_data(web::Data::new(encrypt_clients.clone()))
        .service(test)
        .configure(account_config)
    }).bind(format!("{}:{}",server_cfg.server,server_cfg.port))?.run().await
}
