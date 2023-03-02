use log::LevelFilter;
use log::{info, debug, error};
use std::fs::File;


pub fn enable_logging(log_file_var: &str, log_level_var: &str)-> Result<(), String>{
    
    let log_file = match std::env::var(log_file_var){
        Ok(val) => val,
        Err(_e) => "".to_string(),
    };

    let level: LevelFilter;

    let log_level_val = match std::env::var(log_level_var){
        Ok(val) => val,
        Err(_e) => "0".to_string(),
    };

    match log_level_val.parse::<i32>() {
        Ok(val) => match val {
            2 => level = LevelFilter::Debug,
            1 => level = LevelFilter::Debug,
            _ => level = LevelFilter::Debug,
        },
        Err(_e) => level = LevelFilter::Debug,
    };
    
    info!("Log Level is {}", level);

    let result = File::create(&log_file);
    match result {
        Ok(..) => {
            simple_logging::log_to_file(log_file, level).expect("Logging should occur at log_file");
            Ok(())
        }
        Err(e) => {
            simple_logging::log_to_stderr(level);
            error!("{}", e);
            Err(format!("Failed to open file \"{}\"", log_file))
        }
    }
    
}
