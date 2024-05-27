
use std::sync::Mutex;

use flexi_logger::{colored_with_thread, Age, Cleanup, Criterion, DeferredNow, Duplicate, FileSpec, LogSpecification, Logger, Naming, WriteMode};
use log::{ debug, error, info, trace, warn, Level, Record};

/*
fn colored_format(record: &Record, now: &mut DeferredNow, _style: &Record) -> String {
  
    let level = record.level();
    let message = record.args();
    let time = now.now().format("%Y-%m-%d %H:%M:%S");

    match level {
        Level::Info => format!("{} - {} - {}", time, "INFO".blue(), message),
        Level::Warn => format!("{} - {} - {}", time, "WARN".yellow(), message),
        Level::Error => format!("{} - {} - {}", time, "ERROR".red(), message),
        _ => format!("{} - {:?} - {}", time, level, message),
    }
} */

pub fn init() {
    Logger::with(LogSpecification::info())
        
        .duplicate_to_stdout(Duplicate::All) 
        .log_to_file(FileSpec::default().directory("./logs").suffix("log") )
        .format(colored_with_thread)
        .rotate(
            Criterion::Age(Age::Day), // rotate by day
            Naming::Timestamps,       // use timestamp to name log files.
            Cleanup::KeepLogFiles(30) // recent 30 log file reserved.
        )
        .start()
        .expect("Logger initialization failed");
}
#[allow(non_snake_case)]
#[track_caller]
pub fn Info(info:&String){
    let location = std::panic::Location::caller();
    info!("{} - [{}:{}]", info, location.file(), location.line());
}
#[allow(non_snake_case)]
#[track_caller]
pub fn Warn(info:&String){
    let location = std::panic::Location::caller();
    warn!("{} - [{}:{}]", info, location.file(), location.line());
}

#[allow(non_snake_case)]
#[track_caller]
pub fn Error(info:&String){
    let location = std::panic::Location::caller();
    error!("{} - [{}:{}]", info, location.file(), location.line());
}
#[allow(non_snake_case)]
#[track_caller]
pub fn Debug(info:&String){
    let location = std::panic::Location::caller();
    debug!("{} - [{}:{}]",info, location.file(), location.line()); 
}