use serde::Serialize;
use serde_json::Value;

#[derive(Serialize)]
pub struct RepStatus{
    pub status:String,
    pub data:Value
}