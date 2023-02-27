fn normalize(value: f32, range: f32) -> f32 {

    value / range
}
fn min(n1: f32, n2: f32) -> f32 {
    if n1 > n2 {
        return n2;
    }
    return n1;
}

pub fn get_ramp_up_time(codebase_length: &str) -> f32 {
    let codebase_length = match codebase_length.parse::<f32>() {
        Ok(n) => n,
        Err(_) => {
            -1.0
        }
    };
    normalize(min(codebase_length, 50000.0), 50000.0)
}

pub fn get_correctness(opened_issues: &str) -> f32 {
    let opened_issues = match opened_issues.parse::<f32>() {
        Ok(n) => n,
        Err(_) => -1.0
    };
    normalize(min(opened_issues, 2000.0), 2000.0)
}

pub fn get_bus_factor(number_of_forks: &str) -> f32 {
    let number_of_forks = match number_of_forks.parse::<f32>() {
        Ok(n) => n,
        Err(_) => -1.0
    };
    normalize(min(number_of_forks, 1000.0), 1000.0)
}

pub fn get_license(license: &str) -> f32 {
    let mut names: Vec<String> = Vec::new();
    names.push("LGPLv2.1".to_owned());
    names.push("gnu lesser general public license".to_owned());
    names.push("gnu lesser general public license v2.1".to_owned());
    names.push("LGPL".to_owned());

    let mut has_license = 0.0;

    for name in names {
        if license.contains(&name) {
            has_license = 1.0;
            break;
        }
    }

    return has_license;
}

pub fn get_responsive_maintainer() -> f32 {
    -1.0
}

pub fn get_overall(metrics: &[f32]) -> f32 {
    let sum: f32 = metrics.iter().sum();
    sum / metrics.len() as f32
}
