use std::{fmt, io::Read, str::FromStr, string};
use crate::error::Error;

use ethers::middleware::SignerMiddleware;
use ethers::signers::{LocalWallet, Signer};
use ethers::types::Chain;
use secp256k1;
use hmac::{Hmac, Mac};
use sha2::{Digest, Sha256, Sha512};
use ed25519_dalek::{PublicKey, SecretKey};
use hex::FromHex;

use solana_sdk::bs58;
use solana_sdk::signature::Keypair;
use solana_sdk::signer::{EncodableKeypair, SeedDerivable};
use solana_sdk::{pubkey::Pubkey};
use ethers::{prelude::Wallet};
use ethers::providers::{Provider, Http};

// 2. Add client type
type Client = SignerMiddleware<Provider<Http>, Wallet<secp256k1::ecdsa::Signature>>;
const ED25519_CURVE:&[u8;12] = b"ed25519 seed";
const HARDENED_OFFSET: u32 = 0x80000000;
type HmacSha512 = Hmac<Sha512>;
type Key: = Vec<u8>;
type ChainCode = Vec<u8>;
#[derive(Debug,Clone)]
pub struct ChainKeys {
    pub key: Key,
    pub chain_code: ChainCode,
}
/*
fn get_master_key_from_seed(seed: &str) -> ChainKeys {
    let mut hmac = Hmac::<Sha512>::new_from_slice(ED25519_CURVE.as_bytes()).unwrap();
    hmac.update(&Vec::from_hex(seed).unwrap());
    let i = hmac.finalize().into_bytes();

    ChainKeys {
        key: i[0..32].to_vec(),
        chain_code: i[32..].to_vec(),
    }
}
 */
/// A wrapper around the [secp256k1::SecretKey]
/// struct to be used with [HDKey].
#[derive(Debug, Clone,  PartialEq, Eq)]
pub struct ExtendedPrivateKey(secp256k1::SecretKey);

impl ExtendedPrivateKey {
    /// Creates a new [ExtendedPrivateKey] from a slice of bytes.
    pub fn from_slice(data: &[u8]) -> Result<ExtendedPrivateKey, Error> {

        let secret_key = secp256k1::SecretKey::from_slice(data)?;
        Ok(ExtendedPrivateKey(secret_key))
    }

    /// Returns the bytes of the [ExtendedPrivateKey].
    pub fn to_bytes(&self) -> [u8; 32] {
        *self.0.as_ref()
    }

    /// Converts the [ExtendedPrivateKey] to an [ExtendedPublicKey].
    pub fn to_public_key(&self) -> ExtendedPublicKey {
        ExtendedPublicKey(secp256k1::PublicKey::from_secret_key(
            &secp256k1::Secp256k1::new(),
            &self.0,
        ))
    }

    /// Adds a tweak to the underlying private key.
    pub fn add_tweak(mut self, tweak: &secp256k1::Scalar) -> Result<Self, Error> {
        self = ExtendedPrivateKey(self.0.add_tweak(tweak)?);
        Ok(self)
    }
}

impl fmt::LowerHex for ExtendedPrivateKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if f.alternate() {
            f.write_str("0x")?;
        }

        for byte in &self.to_bytes() {
            write!(f, "{:02x}", byte)?;
        }

        Ok(())
    }
}

/// A wrapper around the [secp256k1::PublicKey]
/// struct to be used with [HDKey]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ExtendedPublicKey(secp256k1::PublicKey);

impl ExtendedPublicKey {
    /// Creates a new [ExtendedPublicKey] from a slice of bytes.
    pub fn from_slice(slice: &[u8]) -> Result<Self, Error> {
        Ok(Self(secp256k1::PublicKey::from_slice(slice)?))
    }

    /// Creates a new [ExtendedPublicKey] from an [ExtendedPrivateKey].
    pub fn from_private_key(private_key: &ExtendedPrivateKey) -> Self {
        private_key.to_public_key()
    }

    /// Converts the [ExtendedPublicKey] a byte array.
    pub fn to_bytes(&self) -> [u8; 33] {
        self.0.serialize()
    }
}

impl fmt::LowerHex for ExtendedPublicKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if f.alternate() {
            f.write_str("0x")?;
        }

        for byte in &self.to_bytes() {
            write!(f, "{:02x}", byte)?;
        }

        Ok(())
    }
}

pub async fn generate_ethereum_public_key(mnemonic_phrase: &str)->Option<String>  {
    let bip39_mnemonic = bip39::Mnemonic::from_phrase(mnemonic_phrase,bip39::Language::English).unwrap();
    let seed = bip39::Seed::new(&bip39_mnemonic, "");

    // 定义 BIP44 的派生路径
    let path = bip32::DerivationPath::from_str("m/44'/60'/0'/0/0").unwrap();
        
    // 使用派生路径从 Seed 派生出私钥
    let xprv = bip32::XPrv::derive_from_path(&seed.as_bytes(), &path).unwrap();
    
    // 获取派生出的私钥

    let private_key = ethers::core::k256::ecdsa::SigningKey::from_bytes(&xprv.private_key().to_bytes()).unwrap();
    let wallet = Wallet::from(private_key);

    println!("Wallet: {:?}",wallet.address());
    
    Some(wallet.address().to_string())

}

pub fn generate_solana_private_key(mnemonic_phrase:&str)-> Option<String>{
    let keypair = generate_solana_keypair(mnemonic_phrase).expect("generate_solana_private_key error");
    Some(bs58::encode(keypair.to_bytes())
    .with_alphabet(bs58::Alphabet::BITCOIN)
    .into_string())
}

pub fn generate_solana_public_key(mnemonic_phrase:&str)-> Option<Keypair>{
    if let Some(keypair) = generate_solana_keypair(mnemonic_phrase){
        return Some(keypair);
    }
    None
}

pub fn generate_solana_keypair(mnemonic_phrase:&str) -> Option<Keypair>{
    let derivation_path = "m/44'/501'/0'/0'";
    let bip39_mnemonic = bip39::Mnemonic::from_phrase(mnemonic_phrase,bip39::Language::English).unwrap();
    let seed = bip39::Seed::new(&bip39_mnemonic, "");

    let mut mac: HmacSha512 = HmacSha512::new_from_slice(ED25519_CURVE).unwrap();
    mac.update(seed.as_bytes());
    let hmac = mac.finalize().into_bytes();

    let mut extended_private_key_bytes = [0u8; 32];
    extended_private_key_bytes.copy_from_slice(&hmac[0..32]);
    let mut chain_code = [0u8; 32];
    chain_code.copy_from_slice(&hmac[32..]);
    let extended_private_key = ExtendedPrivateKey::from_slice(&extended_private_key_bytes).unwrap();
    //let extended_public_key = ExtendedPublicKey::from_private_key(&extended_private_key);

    let init_keys = ChainKeys{key:extended_private_key.to_bytes()[..32].to_vec().try_into().unwrap(),chain_code:chain_code.to_vec().try_into().unwrap()};
    let chainkeys =derive(derivation_path,init_keys.clone(),0);


    let secret_key = ed25519_dalek::SecretKey::from_bytes(&chainkeys.key.to_vec()).expect("Failed to create secret key from bytes");
    let public_key = ed25519_dalek::PublicKey::from(&secret_key);
    let ed_keypair = ed25519_dalek::Keypair { secret: secret_key, public: public_key };
    // 手动组合密钥对字节
    let mut keypair_bytes = vec![0u8; 64];
    keypair_bytes[..32].copy_from_slice(&ed_keypair.secret.to_bytes());
    keypair_bytes[32..].copy_from_slice(&ed_keypair.public.to_bytes());
    let keypair = Keypair::from_bytes(&keypair_bytes).expect("Invalid keypair bytes");
    Some(keypair)
    // 创建Solana密钥对
    //let solana_keypair = solana_sdk::signer::keypair::Keypair::from_bytes(&keypair_bytes).expect("Invalid keypair bytes");
   // let keypair = ed25519_dalek::Keypair::from_bytes(&keypair_bytes.to_vec().as_ref()).unwrap();
    //let public_key = keypair.public;

    //println!("Keypaire: {:?}\r\n", solana_keypair.pubkey().to_string());
/*
    Ok(Self {
        master_seed: seed,
        chain_code,
        extended_private_key: Some(extended_private_key),
        extended_public_key: Some(extended_public_key),
        depth: 0,
        parent_fingerprint: [0u8; 4],
        derivation_path: HDPath::from_str("m")?,
        network: network_type,
        child_index: 0,
        derivation_purpose: HDPurpose::default(),
    }) */
}
fn ckd_priv(parent_keys: &ChainKeys, index: u32) -> ChainKeys {
    let index_bytes = index.to_be_bytes().to_vec();
    //index_bytes.insert(0, 0);

    let mut data = vec![0u8];
    data.extend_from_slice(&parent_keys.key);
    data.extend_from_slice(&index_bytes);

    let mut hmac = Hmac::<Sha512>::new_from_slice(&parent_keys.chain_code).unwrap();
    hmac.update(&data);
    let i = hmac.finalize().into_bytes();

    ChainKeys {
        key: i[0..32].to_vec(),
        chain_code: i[32..].to_vec(),
    }
}
/* 
fn get_public_key(private_key: &[u8], with_zero_byte: bool) -> Vec<u8> {
    let keypair = Keypair::from_bytes(private_key).unwrap();
    let sign_pk = keypair.public.to_bytes();

    if with_zero_byte {
        let mut result = vec![0];
        result.extend_from_slice(&sign_pk);
        result
    } else {
        sign_pk.to_vec()
    }
}
*/
fn is_valid_path(path: &str, replace_derive: fn(&str) -> Option<u32>) -> bool {
    path.split('/')
        .skip(1) // 跳过路径的第一个部分（通常是"m"）
        .map(replace_derive) // 将replace_derive应用于每个部分
        .all(|x| x.is_some()) // 使用闭包来检查所有Option是否都是Some
}
fn replace_derive(segment: &str) -> Option<u32> {
    segment.trim_end_matches('\'').parse::<u32>().ok()
}

pub fn derive(path: &str, initial_keys:ChainKeys, _offset: u32) -> ChainKeys{
    let  mut offset = _offset;
    if offset==0{
        offset=HARDENED_OFFSET;
    }
    if !is_valid_path(path, replace_derive) {
        panic!("Invalid derivation path");
    }

   // let initial_keys = get_master_key_from_seed(seed);
    let segments = path.split('/')
                       .skip(1)
                       .filter_map(replace_derive) // 这里使用filter_map确保只处理成功转换的u32值
                       .collect::<Vec<u32>>();

    segments.iter().fold(initial_keys, |acc, &segment| {
        ckd_priv(&acc, segment + offset)
    })
/*
    let keys = segments.iter().fold(initial_keys, |acc, &segment| {
        ckd_priv(&acc, segment + offset)
    });
     */
    /*
    let mut bl64 = vec![0u8,64];
    bl64[..32].copy_from_slice(&keys.key.to_vec());
    bl64[32..].copy_from_slice(&keys.chain_code.to_vec());
    PublicKey::from_bytes(&keys.key.as_ref()).unwrap();
     */
    //Pubkey::new_from_array(keys.key.try_into().unwrap())
}
