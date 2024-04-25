
use flexi_logger::{colored_with_thread, Age, Cleanup, Criterion, DeferredNow, Duplicate, FileSpec, LogSpecification, Logger, Naming};
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
pub fn Info(info:&String){
    info!("{}", info);
}
#[allow(non_snake_case)]
pub fn Warn(info:&String){
    warn!("{}", info);
}
#[allow(non_snake_case)]
pub fn Error(info:&String){
    error!("{}", info);
}
#[allow(non_snake_case)]
pub fn Debug(info:&String){
    debug!("{}",info); 
}