mod status;
mod common;
mod routes;
mod middleware;
mod db;
mod jwt;
use jwt::get_exp;
use middleware::token_checker::{TokenChecker, TokenCheckerMiddleware};
use std::{future, io, sync::{Arc, Mutex}, time};
use dotenv::dotenv;
use actix::SyncArbiter;
use actix_extensible_rate_limit::{backend::{memory::InMemoryBackend, SimpleInputFunctionBuilder}, RateLimiter};

use dbengine::{utils::{DbActor, DbState}};
use std::time::Duration;
use actix_cors::Cors;
use actix_web::{ cookie, http, web, App, HttpServer};

use routes::{account::impls::account_routes, subaccount::impls::subaccount_routes};
use coins::SolanaCoin;
use common::CryptClients;
use status::RepStatus;
use serde::{Deserialize, Serialize};
use solana_client::rpc_client::RpcClient;

use diesel::{r2d2::{ConnectionManager, Pool}, PgConnection};
use std::env;


#[derive(Serialize,Deserialize)]
struct ServerConfig {
    server: String,
    port:String,
    solana:String,
    eth:String,
    poly:String,
    dbserver:String,
    dbname:String,
    dbuser:String,
    dbpwd:String
}


#[actix_web::main]
async fn main()->io::Result<()> {
    dotenv().ok();
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

    let dbserver = server_cfg.dbserver.clone();
    let dbname = server_cfg.dbname.clone();
    let dbuser = server_cfg.dbuser.clone();
    let dbpwd = server_cfg.dbpwd.clone();


    /*
    let manager = ConnectionManager::<PgConnection>::new(format!("postgres://{}:{}@{}/{}",dbuser,dbpwd,dbserver,dbname));
    let pool = Pool::builder().build(manager).unwrap();
    let dbpool = dbengine::create_pool(&dbserver.clone(),&dbuser.clone(),&dbpwd.clone(),&dbname.clone()).unwrap();
     */

    let dburl = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = dbengine::utils::get_pool(&dburl);
    let db_addr = SyncArbiter::start(5,move ||{
        DbActor(pool.clone())
    });
    let encrypt_clients = Arc::new(Mutex::new(CryptClients{solana,eth,poly}));

    //create db when startup
    let _=web::block(move||{dbengine::create_db(&dbserver.clone(),&dbuser.clone(),&dbpwd.clone())}).await.unwrap();
    let backend = InMemoryBackend::builder().build();

    HttpServer::new(move||{
        //rate limit is 3 times per second
        let input = SimpleInputFunctionBuilder::new(Duration::from_secs(1), 3).real_ip_key().build();
        let middleware = RateLimiter::builder(backend.clone(), input).add_headers().build();
        
        let cors = Cors::permissive()
                        .supports_credentials();
                        //.max_age(Some(get_exp() as usize)); 

        App::new().wrap(middleware.clone())
        //.wrap(TokenChecker)
        .wrap(cors)
        //.wrap(SessionMiddleware::new(CookieSessionStore::default(), Key::generate().clone()))
        /*
        .wrap(
            SessionMiddleware::builder(CookieSessionStore::default(), secret_key.clone())
                .session_lifecycle(
                    PersistentSession::default()
                        .session_ttl(actix_web::cookie::time::Duration::weeks(2)),
                )
                .cookie_secure(false)
                .build(),
        ) */
        //.app_data(web::Data::new(UserSession{users:Mutex::new(Vec::new())}).clone())
        .app_data(web::Data::new(DbState{db:db_addr.clone()}))
        .app_data(web::Data::new(encrypt_clients.clone()))
        
        .configure(account_routes)
        .configure(subaccount_routes)
    }).bind(format!("{}:{}",server_cfg.server,server_cfg.port))?.run().await
}
