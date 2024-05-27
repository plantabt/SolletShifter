// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use std::io::{Read, Write};
use std::str::FromStr;
use std::thread;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, LogicalSize, Manager, WindowBuilder};
use tauri::PhysicalSize; // 引入 PhysicalSize
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[derive(Serialize, Deserialize,Debug,Clone)]
struct ClientConfig{
    server:String,
}
#[tauri::command]
fn get_server() -> String {
    let cli_cfg:ClientConfig = Config::ReadCfg().unwrap();
    cli_cfg.server
}

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

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
        .invoke_handler(tauri::generate_handler![get_version,get_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
