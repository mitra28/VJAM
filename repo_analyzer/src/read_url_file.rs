//! Handles reading in the input URL file

use std::fs::File;
use std::io::{BufReader, BufRead};

/// Converts a text file into a vector of [String]s
pub fn read_lines(filename: &str) -> Vec<String> {
    let file = match File::open(filename) {
        Ok(file) => file,
        Err(e) => panic!("Failed to open file: {}", e),
    };
    let reader = BufReader::new(file);
    let mut lines = Vec::new();
    for line in reader.lines() {
        lines.push(line.unwrap());
    }
    lines
}

