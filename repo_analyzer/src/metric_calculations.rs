//! Contains all functions needed for metric calculations
use std::collections::HashMap;

fn normalize(value: f32, range: f32) -> f32 {

    value / range
}
fn min(n1: f32, n2: f32) -> f32 {
    if n1 > n2 {
        return n2;
    }
    return n1;
}

/// Calculates the metric ramp-up time based on a codebase's length
pub fn get_ramp_up_time(opened_issues: &str, number_of_forks: &str) -> f32 {
    let open_issues = match opened_issues.parse::<f32>() {
        Ok(n) => n,
        Err(_) => {
            -1.0
        }
    };

    let number_of_forks = match number_of_forks.parse::<f32>() {
        Ok(n) => n,
        Err(_) => {
            -1.0
        }
    };
    let score = 1.0 - open_issues/number_of_forks;
    if open_issues == -1.0 {
        return -1.0;
    }
    score as f32
}


/// Calculates the metric correctness based on how many opened issues a codebase has
pub fn get_correctness(opened_issues: &str) -> f32 {
    let opened_issues = match opened_issues.parse::<f32>() {
        Ok(n) => n,
        Err(_) => -1.0
    };
    normalize(min(opened_issues, 2000.0), 2000.0)
}

/// Calculates the metric bus factor based on the number of forks a codebase has
pub fn get_bus_factor(number_of_forks: &str) -> f32 {
    let number_of_forks = match number_of_forks.parse::<f32>() {
        Ok(n) => n,
        Err(_) => -1.0
    };
    normalize(min(number_of_forks, 1000.0), 1000.0)
}

/// Checks to see if license matches any known values
pub fn get_license(license: Result<String, String>) -> f32 {
    // println!("info: {:?}", license);
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
        Err(_error) => return 0.0,
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

/// Checks to see what the ratio of version pinning is
pub fn version_pin(result: Result<Vec<(String, String)>, Box<dyn std::error::Error>>) -> f32 {
    let mut major_minor = 0.0;
    let mut major = 0.0;
    let mut total = 0.0;
    match result {
        Ok(vec) => {
            for (_, s2) in vec {
                total = total + 1.0;
                let _version = match s2.strip_prefix('^') {
                    Some(v) => v,
                    None => match s2.strip_prefix('~') {
                        Some(v) => v,
                        None => &s2,
                    },
                };
                if s2.ends_with(".x") {
                    major = major + 1.0;
                }
                else{
                    major_minor = major_minor + 1.0;
                }
            }
            return (((major_minor) + (0.5 * major)) / total) as f32;
        },
        Err(e) => {
            println!("Error: {}", e);
            return -1.0;
        }
    }
}

/// Checks the adherence score of a repository
pub fn get_adherence_score(total_closed: Result<i32, String>, total_reviewers: Result<i32, String>) -> f32 {
    // If total_closed is an error or 0, return a score of 0
    let closed_count = match total_closed {
        Ok(count) => {
            if count == 0 {
                return 0.0;
            }
            count
        },
        Err(_) => return -1.0,
    };

    // If total_reviewers is an error, return a score of 0
    let reviewer_count = match total_reviewers {
        Ok(count) => count,
        Err(_) => return -1.0,
    };

    // Calculate adherence score
    let score = (reviewer_count as f32) / (closed_count as f32);

    score
}

/// Determines the responsive maintainer score
pub fn get_responsive_maintainer(opened_issues: &str, total_issues: &str) -> f32 {
    let opened_issues = match opened_issues.parse::<f32>() {
        Ok(n) => n,
        Err(_) => -1.0
    };
    let total_issues = match total_issues.parse::<f32>() {
        Ok(n) => n,
        Err(_) => -1.0
    };

    let score = opened_issues/total_issues;
    if opened_issues == -1.0 {
        return -1.0;
    }
    score as f32
}

/// Calculates the metric net score by averaging all other metrics
pub fn get_overall(metrics: &[f32]) -> f32 {
    // called in main L224-> let metrics = [ru, c, bf, l, rm]; 

    // let sum: f32 = metrics.iter().sum();
    // sum / metrics.len() as f32
    let sum: f32 = 0.4 * metrics[2] + 0.2 * (metrics[0] + metrics[1] + metrics[3] + metrics[4]); 
    sum as f32
}
