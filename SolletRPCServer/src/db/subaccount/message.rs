use actix::Message;
use chrono::{DateTime, Utc};
use diesel::QueryResult;
use serde_json::Value;
use crate::db::subaccount::models::{SubAccount,InsertSubAccount};
#[derive(Message)]
#[rtype(result = "QueryResult<Vec<SubAccount>>")]
pub struct FetchSubAccount{
    pub owner: String,
}

#[derive(Message)]
#[rtype(result = "QueryResult<usize>")]
pub struct InsSubAccount {
  pub account: Value,
  pub owner:String,
  pub create_time: DateTime<Utc>,
  pub privatekey:String,
}