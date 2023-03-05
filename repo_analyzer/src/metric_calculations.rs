//! Contains all functions needed for metric calculations
use std::collections::HashMap;


/// Calculates the metric ramp-up time based on a codebase's length
pub fn get_ramp_up_time(codebase_length: &str) -> f32 {
    // let codebase_length = match codebase_length.parse::<f32>()
    // numbers -> format!("{}, {}", open_issues_val.unwrap(), forks_val.unwrap()

    //let numbers: Vec<f32> = codebase_length.split(",");
    let float_vec: Vec<f32> = codebase_length
        .split(',')
        .map(|s| s.parse().unwrap())
        .collect();
    // let issue_forks_ratio = match codebase_length.parse::<f32>()
    // {
    //     Ok(n) => n,
    //     Err(_) => {
    //         <-1.0, -1.0>
    //     }
    // };
    let score = 1.0 - float_vec[0]/float_vec[1];
    // normalize(min(score, 50000.0), 50000.0)
    score as f32
}


/// Calculates the metric correctness based on how many opened issues a codebase has
pub fn get_correctness(opened_issues: &str) -> f32 {
    let opened_issues = match opened_issues.parse::<f32>() {
        Ok(n) => n,
        Err(_) => -1.0
    };
    // normalize(min(opened_issues, 2000.0), 2000.0)
    opened_issues as f32
}

/// Calculates the metric bus factor based on the number of forks a codebase has
pub fn get_bus_factor(number_of_forks: &str) -> f32 {
    let number_of_forks = match number_of_forks.parse::<f32>() {
        Ok(n) => n,
        Err(_) => -1.0
    };
    // normalize(min(number_of_forks, 1000.0), 1000.0)
    number_of_forks as f32
}

pub fn get_license(license: Result<String, String>) -> f32 {
    println!("info: {:?}", license);
    let mut valid_license = HashMap::<String, f32>::new();
    valid_license.insert("apache".to_string(), 0.0);
    valid_license.insert("mit".to_string(), 1.0);
    valid_license.insert("gpl".to_string(), 1.0);
    valid_license.insert("lgpl".to_string(), 1.0);
    valid_license.insert("ms-pl".to_string(), 1.0);
    valid_license.insert("epl".to_string(), 0.0);
    valid_license.insert("bsd".to_string(), 1.0);
    valid_license.insert("cddl".to_string(), 0.0);

    let license_str = match license {
        Ok(value) => value,
        Err(error) => return 0.0,
    };
    
    let l_score = 0.0;
    if valid_license.contains_key(&license_str){
        match valid_license.get(&license_str) {
            Some(value) => return *value,
            None => return l_score,
        }

    }else{
        return l_score
    }
}


pub fn get_responsive_maintainer(opened_issues: &str, closed_issues: &str) -> f32 {
    let opened_issues = match opened_issues.parse::<f32>() {
        Ok(n) => n,
        Err(_) => -1.0
    };
    let _closed_issues = match closed_issues.parse::<f32>() {
        Ok(n) => n,
        Err(_) => -1.0
    };

    normalize(min(opened_issues, 2000.0), 2000.0)
}

/// Calculates the metric net score by averaging all other metrics
pub fn get_overall(metrics: &[f32]) -> f32 {
    // called in main L224-> let metrics = [ru, c, bf, l]; // responsive maintainer is omitted

    // let sum: f32 = metrics.iter().sum();
    // sum / metrics.len() as f32
    let sum: f32 = 0.4 * metrics[2] + 0.2 * (metrics[0] + metrics[1] + metrics[3]); 
    sum as f32
}
