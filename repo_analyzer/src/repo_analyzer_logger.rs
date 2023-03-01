use std::fs::{File, OpenOptions};
//use std::process::Command;
use std::{env};
use std::io::Write;
//use std::path::Path;
//use log::logger;

pub struct Logger {
    file: File
}
impl Logger {
    // LOG_LEVEL
    pub fn from_env_var(var: &str) -> Result<Self, String>{
        let res = env::var(var);
        if res.is_err() {
            return Err(res.err().unwrap().to_string())
        }

        Logger::new(&res.unwrap())
    }

    pub fn new(log_file: &str) -> Result<Self, String> {
        let file_res = OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_file);
        
        if file_res.is_err(){
            return Err(format!("Unable to open file: {}", log_file));
        }

        let file = file_res.unwrap();

        Ok(Logger {file })
    }

    pub fn log_info(self: &mut Logger, msg: &str) {
        let full_msg = format!("[INFO]: {}\n", msg);
        match self.file.write(full_msg.as_bytes()) {
            Ok(_) => return,
            Err(_e) => return,
        }
    }
    pub fn log_warning(self: &mut Logger, msg: &str) {
        let full_msg = format!("[WARNING]: {}\n", msg);
        match self.file.write(full_msg.as_bytes()) {
            Ok(_) => return,
            Err(_e) => return,
        }
    }
    pub fn log_error(self: &mut Logger, msg: &str) {
        let full_msg = format!("[ERROR]: {}\n",msg);
        match self.file.write(full_msg.as_bytes()) {
            Ok(_) => return,
            Err(_e) => return,
        }
    }
}