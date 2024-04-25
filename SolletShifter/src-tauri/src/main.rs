// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
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
