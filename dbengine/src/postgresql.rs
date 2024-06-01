use chrono::{DateTime, NaiveDateTime, Utc};
use deadpool_postgres::{Config, Manager, ManagerConfig, Object, Pool, PoolError, RecyclingMethod, Runtime};
use tokio_postgres::{types::Timestamp, Error, NoTls};
use serde::{Deserialize, Serialize};

use crate::Account;

pub type DbPool  = Pool;
pub fn create_pool(host:&str,user:&str,pwd:&str,dbname:&str) -> Result<DbPool, Error> {
    let mut cfg = Config::new();
    cfg.host = Some(host.to_string());
    cfg.user = Some(user.to_string());
    cfg.password = Some(pwd.to_string());
    cfg.dbname = Some(dbname.to_string());
    cfg.manager = Some(ManagerConfig { recycling_method: RecyclingMethod::Fast });
    Ok(cfg.create_pool(Some(Runtime::Tokio1),NoTls).unwrap())

}

async fn get_pool_client(pool:&DbPool)->Option<Object> {
    let db_connect;
    match pool.get().await{
        Ok(conn) => {
            db_connect = conn;
            //QuickLogger::Info(&format!("Get db connection:{:?}",&db_connect));
        },
        Err(e) => {
            QuickLogger::Error(&format!("Get connection error: {}",e));
            return None;
        }
    };
    Some(db_connect)
}

pub async fn create_account(pool:&DbPool,name:&str,privatekey:&str,phrase:&str,create_ip:&str)->Result<(), String> {

    if let Some(db_connect) = get_pool_client(pool).await{
        let stmt = db_connect.prepare("INSERT INTO account (name, privatekey, phrase,modify_time, create_ip) VALUES ($1, $2, $3,CURRENT_TIMESTAMP, $4)").await.unwrap();
        match db_connect.execute(&stmt, &[&name, &privatekey, &phrase, &create_ip]).await{
            Ok(_) => {
                QuickLogger::Warn(&format!("Account '{}' created successfully",name));
            },
            Err(e) => {
                QuickLogger::Error(&format!("Account '{}' created failed: {}",name,e));
                return Err(e.to_string())
            }
        };
    }

    Ok(())
}
fn get_timestamp_to_string(timestamp:i64)->String{
    let milliseconds = (timestamp % 1000) as u32;
    let timestamp_as_u64 = NaiveDateTime::from_timestamp(timestamp, milliseconds);
    timestamp_as_u64.format("%Y-%m-%d %H:%M:%S.%3f").to_string()
}
pub async fn is_account_exist(pool:&DbPool,privatekey:&str)-> Option<Account> {
    if let Some(db_connect) = get_pool_client(pool).await{
        let stmt = db_connect.prepare("SELECT * FROM account WHERE privatekey = $1").await.unwrap();
        let rows = db_connect.query(&stmt, &[&privatekey]).await.unwrap();
        QuickLogger::Warn(&format!("is_account_exist privkey:{}-{:#?}",privatekey,rows));
        if let Some(row)=rows.get(0){
  
            QuickLogger::Warn(&format!("timestamp:{}",get_timestamp_to_string(row.get("create_time"))));
            let account = Some(Account{
                id: row.get(0),
                username: row.get(1),
                privatekey: row.get(2),
                phrase: row.get(3),
                create_date: row.get("create_time"),
                modify_time: row.get("modify_time"),
                create_ip: row.get(6),
                login_time: row.get("login_time")
            });
            return account;
        }

    }
   
    None
   
    
}
/*
#[tokio::main]
pub async fn connect_pdb()->Result<(), Error> {
    Ok(())
} */
async fn connect_to_db(conn_str: &str) -> Result<tokio_postgres::Client, Error> {
    let (client, connection) = tokio_postgres::connect(conn_str, NoTls).await?;
    tokio::spawn(async move {
        if let Err(e) = connection.await {
            QuickLogger::Error(&format!("Connection error: {}", e));
        }
    });
    Ok(client)
}
#[tokio::main]
pub async  fn create_db(host:&str,user:&str,pwd:&str) -> Result<(), Error> {

    // connect to db server
    let client = connect_to_db(&format!("host=localhost host={} user={} password={}",host,user,pwd)).await?;
    client.batch_execute("CREATE DATABASE ssdb").await?;
   
    // reconnect to ssdb
    let client = connect_to_db(&format!("host=localhost dbname=ssdb host={} user={} password={}",host,user,pwd)).await?;
    // create table
    client.batch_execute(
        r#"
        CREATE TABLE "public"."account" ( 
            "id" SERIAL,
            "name" TEXT NOT NULL,
            "privatekey" TEXT NOT NULL,
            "phrase" TEXT NULL,
            "create_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP ,
            "modify_time" TIMESTAMP WITH TIME ZONE NOT NULL,
            "create_ip" TEXT NOT NULL,
            "login_time" TIMESTAMP WITH TIME ZONE NULL,
            "login_ip" TEXT NULL,
            CONSTRAINT "account_pkey" PRIMARY KEY ("id", "privatekey"),
            CONSTRAINT "UQ_account_privatekey" UNIQUE ("privatekey")
          );
          


          CREATE TABLE "public"."subaccount" ( 
            "id" SERIAL,
            "account" JSONB NOT NULL,
            "owner" TEXT NOT NULL,
            "create_time" TIMESTAMP WITH TIME ZONE NOT NULL,
            "privatekey" TEXT NOT NULL,
            CONSTRAINT "subaccount_pkey" PRIMARY KEY ("id")
          );
          CREATE INDEX "IX_account_id" 
          ON "public"."account" (
            "id" ASC
          );
          CREATE INDEX "IX_subaccount_id" 
          ON "public"."subaccount" (
            "id" ASC
          );
          
          
        "#
    ).await?;

    QuickLogger::Warn(&format!("Table 'account' created successfully"));
    
    Ok(())
}
