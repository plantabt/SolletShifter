use serde::Serialize;
use serde_json::Value;

#[derive(Serialize)]
pub struct Status{
    pub status:String,
    pub data:Value
}