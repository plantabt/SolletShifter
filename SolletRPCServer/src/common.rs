use coins::SolanaCoin;
use solana_client::rpc_client::RpcClient;

pub struct CryptClients{
    pub solana:SolanaCoin,
    pub eth:SolanaCoin,
    pub poly:SolanaCoin
}
#[allow(non_snake_case)]
pub enum ResponseStatus{
    OK,
    FAILED,
    ERROR,
    TIMEOUT,
}

impl ResponseStatus{
    pub fn str(&self)->String{
        match self{
            ResponseStatus::OK=>"OK".to_string(),
            ResponseStatus::FAILED=>"FAILED".to_string(),
            ResponseStatus::TIMEOUT=>"TIMEOUT".to_string(),
            ResponseStatus::ERROR=>"ERROR".to_string()
        }
        
    }
}