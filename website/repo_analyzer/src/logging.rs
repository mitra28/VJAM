#![allow(unused_imports)]
//! Responsible for handling all logging. Currently logs either to a file or stderr

use log::LevelFilter;
use log::{info, debug, error};
use std::fs::File;




/// Enables logging to occur either to a given log file or to stderr
///
/// # Arguments
///
/// * 'log_file_var'  - The Environment Variable that contains the path to the file to write logs to
/// * 'log_level_var' - The Environment Variable that contains the level of logging that should occur
///
/// Logging defaults its output to stderr if the log file fails to resolve for any reason
/// Logging defaults its level to 1 (Debug) if the log level fails to resolve for any reason
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
            2 => level = LevelFilter::Info,
            1 => level = LevelFilter::Debug,
            _ => level = LevelFilter::Error,
        },
        Err(_e) => level = LevelFilter::Debug,
    };
    

    let result = File::create(&log_file);
    match result {
        Ok(..) => {
            simple_logging::log_to_file(log_file, level).expect("Logging should occur at log_file");
            error!("Logging to file!");
            Ok(())
        }
        Err(e) => {
            simple_logging::log_to_stderr(level);
            error!("{}", e);
            Err(format!("Failed to open file \"{}\"", log_file))
        }
    }
    
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_invalid_log_file_and_level() {
        let log_file  = "N/A";
        let log_level = "N/A";
        let result = enable_logging(log_file, log_level);
        assert!(result.is_err());
    }
}
