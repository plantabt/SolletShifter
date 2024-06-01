use actix::Message;
use chrono::{DateTime, Utc};
use diesel::QueryResult;
use crate::db::account::models::{Account,UpdateLoginDb};
#[derive(Message)]
#[rtype(result = "QueryResult<Vec<Account>>")]
pub struct FetchAccount{
    pub privatekey: String,
}

#[derive(Message)]
#[rtype(result = "QueryResult<UpdateLoginDb>")]
pub struct UpdateLoginMsg {
  pub name:String,
  pub privatekey: String,
  pub login_time: Option<DateTime<Utc>>,
  pub login_ip: Option<String>,
}

#[derive(Message)]
#[rtype(result = "QueryResult<Account>")]
pub struct EstablishAccount {
  pub name: String,
  pub privatekey: String,
  pub phrase: Option<String>,
  pub create_time: DateTime<Utc>,
  pub modify_time: DateTime<Utc>,
  pub create_ip: String,
  //pub login_time: Option<DateTime<Utc>>,
}