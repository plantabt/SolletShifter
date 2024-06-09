use actix::Message;
use chrono::{DateTime, Utc};
use diesel::QueryResult;
use serde_json::Value;
use crate::db::subaccount::models::{SubAccount,InsertSubAccountMod};
#[derive(Message)]
#[rtype(result = "QueryResult<Vec<SubAccount>>")]
pub struct FetchSubAccountsMsg{
    pub owner: String,
}

#[derive(Message)]
#[rtype(result = "QueryResult<SubAccount>")]
pub struct FetchSubAccountMsg{
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

#[derive(Message)]
#[rtype(result = "QueryResult<usize>")]
pub struct DelSubAccountMsg {
  pub owner:String,
  pub privatekey:String,
}

#[derive(Message)]
#[rtype(result = "QueryResult<usize>")]
pub struct UpdateSubAccountMsg {
  pub owner:String,
  pub privatekey:String,
  pub account:Value,
}