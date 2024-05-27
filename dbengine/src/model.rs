use std::time::SystemTime;

use postgres::types::Timestamp;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, NaiveDateTime, Utc};

#[derive(Debug,Deserialize,Serialize,Clone,PartialEq)]
pub struct Account{
    pub id:i32,
    pub username:String,
    pub privatekey:String,
    pub phrase:String,
    pub create_date: SystemTime,//NaiveDateTime,
    pub modify_time:SystemTime,
    pub create_ip:String,
    pub login_time:SystemTime
}