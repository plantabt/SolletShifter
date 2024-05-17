// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


//use walletd::walletd_bitcoin::bitcoin::base58;
//use walletd::{prelude::*, Mnemonic,HDKey};  
//use walletd_bip39::prelude::*;

/*
use solana_client::rpc_client::RpcClient;
use solana_sdk::{pubkey::Pubkey, signature::Keypair, signer::Signer};
use anyhow::Result;  // Using anyhow for error handling

fn get_solana_balance(mnemonic: &str) -> Result<f64> {
    // Assume we have a function `mnemonic_to_keypair` that converts a mnemonic to a Keypair
    let keypair = mnemonic_to_keypair(mnemonic)?;
    let client = RpcClient::new("https://api.mainnet-beta.solana.com/");
    let balance = client.get_balance(&keypair.pubkey())?;

    // Assuming balance is in lamports, convert to SOL (1 SOL = 1,000,000,000 lamports)
    let balance_in_sol = balance as f64 / 1_000_000_000.0;
    Ok(balance_in_sol)
}

// Hypothetical function to convert mnemonic to a Keypair
// This function would need to handle mnemonic to seed conversion and then derive the keypair
fn mnemonic_to_keypair(mnemonic: &str) -> Result<Keypair> {
    // Conversion logic here
    // This is a placeholder and would need to be implemented based on available Rust libraries
    Err(anyhow::Error::msg("Function not implemented"))
}
 */

async fn mnemonic_to_pubkey(mnemonic_phrase: &str, derivation_path: &str) {

/*
    let solana_keypair=hdwallet::generate_solana_public_key(mnemonic_phrase, derivation_path).unwrap();
    println!("Keypaire: {:?}\r\n", solana_keypair);
    let eth_addr=hdwallet::generate_ethereum_public_key(mnemonic_phrase).await.unwrap();
    println!("Ethereum Address:{}\r\n", eth_addr);
     */
     
  /* 
    let bip39_mnemonic = Bip39Mnemonic::builder().mnemonic_phrase(mnemonic_phrase).build().unwrap();
    let seed = bip39_mnemonic.to_seed();
   // println!("seed_hex: {:x}", seed);
  
    let master_hd_key = HDKey::new_master(seed.clone(), HDNetworkType::MainNet).unwrap();
    
  //  println!("---------- master_hd_key ------------\r\n");
  ////  println!("chain_code: {:?}\r\n",master_hd_key.chain_code.to_vec());
  //  println!("key: {:?}\r\n", master_hd_key.extended_private_key.unwrap().to_bytes());
   //// println!("public key: {:?}\r\n", master_hd_key.extended_public_key.unwrap().to_bytes());
    let init_keys = ckd_derive_path::ChainKeys{key:master_hd_key.extended_private_key.unwrap().to_bytes()[..32].to_vec().try_into().unwrap(),chain_code:master_hd_key.chain_code.to_vec().try_into().unwrap()};
    //let keys =derive_path(&master_hd_key.extended_private_key.unwrap().to_bytes(),&master_hd_key.chain_code.to_vec(),hardend_offset);
    let chainkeys =ckd_derive_path::derive_path("m/44'/501'/0'/0'",init_keys.clone(),0);
    println!("---------- chainkeys ------------\r\n");
    println!("key: {:?} : {}\r\n",chainkeys.key.to_vec(),chainkeys.key.to_vec().len());
    println!("chain_code: {:?} : {}\r\n",chainkeys.chain_code.to_vec(),chainkeys.chain_code.to_vec().len());

    let mut keypair_bytes = vec![0u8; 64];
    keypair_bytes[..32].copy_from_slice(&chainkeys.key.to_vec().as_ref());
    keypair_bytes[32..].copy_from_slice(&chainkeys.chain_code.to_vec().as_ref());

    let secret_key = ed25519_dalek::SecretKey::from_bytes(&chainkeys.key.to_vec()).expect("Failed to create secret key from bytes");
    let public_key = ed25519_dalek::PublicKey::from(&secret_key);
    let ed_keypair = ed25519_dalek::Keypair { secret: secret_key, public: public_key };
    // 手动组合密钥对字节
    let mut keypair_bytes = vec![0u8; 64];
    keypair_bytes[..32].copy_from_slice(&ed_keypair.secret.to_bytes());
    keypair_bytes[32..].copy_from_slice(&ed_keypair.public.to_bytes());

    // 创建Solana密钥对
    let solana_keypair = Keypair::from_bytes(&keypair_bytes).expect("Invalid keypair bytes");
   // let keypair = ed25519_dalek::Keypair::from_bytes(&keypair_bytes.to_vec().as_ref()).unwrap();
    //let public_key = keypair.public;

    println!("Keypaire: {:?}\r\n", solana_keypair.pubkey().to_string());
    //assert_eq!(keypair.to_master_key(), master_hd_key);
  //  let pubkey3 = Pubkey::new_from_array(init_keys.key.try_into().unwrap());
 //   println!("pubkey3: {:?}\r\n",pubkey3.to_string());
/*
    // Convert the mnemonic into a seed
    let mnemonic = Mnemonic::from_phrase(mnemonic,bip39::Language::English).unwrap();
    let seed = Seed::new(&mnemonic, "");
    let master_hd_key = HDKey::new_master(seed, HDNetworkType::mainnet)?;
    
    println!("Seed: {:?}\r\n", seed.as_ref());
    let ext_priv_key = ExtendedPrivKey::derive(&seed.as_ref(), derivation_path).unwrap();
    let pubkey = Pubkey::new_from_array(ext_priv_key.secret());
    println!("Secret: {:?}\r\n", ext_priv_key.secret().bytes());
    println!("Pubkey: {:?}\r\n", pubkey.to_bytes());
    println!("Keypaire: {:?}\r\n", keypair.to_bytes()); */
    */

  
}
use std::io::{Read, Write};
use std::str::FromStr;
use std::thread;
use std::time::Duration;

use tauri::{AppHandle, LogicalSize, Manager, WindowBuilder};
use tauri::PhysicalSize; // 引入 PhysicalSize
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
/*
pub fn configure_webview_shortcuts(app: &AppHandle){
    for (_, window) in app.windows().into_iter() {      
        window
            .with_webview(|webview| unsafe {
                let core_webview: webview2_com::Microsoft::Web::WebView2::Win32::ICoreWebView2 =
                    webview.controller().CoreWebView2().unwrap().cast::<ICoreWebView2>().unwrap();
                let settings = core_webview.Settings().unwrap().cast::<ICoreWebView2Settings3>().unwrap();
                settings.SetAreBrowserAcceleratorKeysEnabled(false).unwrap();

            }).unwrap();
    }

} */
/*
pub fn get_master_key_from_seed(seed: &str) -> Result<(Vec<u8>, Vec<u8>), Box<dyn std::error::Error>> {
    let seed_bytes = hex::decode(seed)?;
    let key = b"ED25519_CURVE"; // Replace this with your actual key
    let mut mac = Hmac::<Sha512>::new(key);

    mac.update(&seed_bytes);

    let result = mac.finalize().into_bytes();
    let (il, ir) = result.split_at(32);

    Ok((il.to_vec(), ir.to_vec()))
} */

fn main() {
     tauri::Builder::default()

        .setup(|app|{

            /*
            let package_name = env!("CARGO_PKG_NAME");
            let mut mainwindow = app.get_window("main");
            if mainwindow==None{
                mainwindow = app.get_window(package_name);
            }
            let appwindow = mainwindow.unwrap();
           // appwindow.set_resizable(true).unwrap();
            let size=PhysicalSize::new(800,400);
            appwindow.set_size(size).unwrap();
            thread::spawn(move||{
                thread::sleep(Duration::from_secs(2));
               // appwindow.set_resizable(false).unwrap();
            });
             */
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
