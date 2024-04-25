use serde::de::DeserializeOwned;
use serde::{Serialize, Deserialize};
use std::fs::File;
use std::io::{self, Read, Write};

#[derive(Serialize, Deserialize)]
struct Config {
    key1: String,
}
#[allow(non_snake_case)]
pub fn  ReadCfg<T>()-> io::Result<T>
where
    T:DeserializeOwned
{
    // 读取配置文件
    let file = File::open("./config.json").unwrap();
    let reader = io::BufReader::new(file);
    let result = serde_json::from_reader(reader).unwrap();
    Ok(result)
    
}
#[allow(non_snake_case)]
pub fn WriteCfg<T>(cfg:T)
where
    T:Serialize
{
    // 写入配置文件
    let new_config = cfg;
    let file = File::create("./config.json").unwrap();
    serde_json::to_writer(file, &new_config).unwrap();
}


