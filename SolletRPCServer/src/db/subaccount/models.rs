
// Generated by diesel_ext

#![allow(unused)]
#![allow(clippy::all)]

use diesel::{associations::Identifiable, deserialize::FromSqlRow, AsChangeset, Insertable, Queryable};

use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;




use crate::db::schema::subaccount;
//#[derive(Queryable, Debug, Serialize)]


#[derive(Queryable, Debug, Serialize,Deserialize)]
#[diesel(primary_key(id))]
pub struct SubAccount {
    pub id:i32,
    pub account: Value,
    pub owner:String,
    pub create_time: DateTime<Utc>,
    pub privatekey:String,
}

#[derive( Debug, Serialize,Queryable,Insertable)]
#[diesel(table_name=subaccount)]
pub struct InsertSubAccount {
    pub account:Value,
    pub owner:String,
    pub create_time: DateTime<Utc>,
    pub privatekey: String,
}