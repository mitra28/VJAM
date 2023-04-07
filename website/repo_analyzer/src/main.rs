#![warn(missing_docs)]
//! This crate generates an executable that fulfills the requirements as specified in the Part 1 - CLI Documents for the
//! course ECE 461 at Purdue University

extern crate libc;
extern crate core;

pub mod repo_list;
pub mod url_input;
pub mod metric_calculations;
pub mod rest_api;
pub mod read_url_file;

pub mod logging;


use crate::rest_api::github_get_response;
use crate::rest_api::github_get_issue_response;
use crate::rest_api::get_closed_pr_comments_count;
use crate::rest_api::get_closed_pr_count;
use crate::rest_api::get_closed_pr_reviews_count;
use crate::rest_api::get_repo_info;
use logging::enable_logging;
use std::error::Error;
use std::process::Command;
use log::{info, debug, error};


// run test_web_api().await to run different examples of using the rest_api functions.
// Make sure to set your github token in your environmental variables under the name 'GITHUB_TOKEN'

/// Handles interpreting command line arguments
#[warn(missing_docs)]
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    handle_command().await?;

    Ok(())
}

async fn handle_command() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = std::env::args().collect();

    if args.len() > 2 {
        println!("Incorrect number of arguments!");
        return Ok(());
    } else if args.len() == 1 {
        return Ok(());
    }

    match args[1].as_str() {
        "install" => run_install(),
        "build" => run_build(),
        "test" => run_test(),
        _ => run_url(&args[1]).await,
    }

    Ok(())
}


/// Installs all needed crates for building the project
fn run_install() {
    Command::new("cargo")
        .args(&["install", "cargo-edit"])
        .output()
        .expect("failed to execute process");

    Command::new("cargo")
        .args(&["add", "reqwest"])
        .output()
        .expect("failed to execute process");

    Command::new("cargo")
        .args(&["add", "serde"])
        .output()
        .expect("failed to execute process");

    Command::new("cargo")
        .args(&["add", "serde_json"])
        .output()
        .expect("failed to execute process");

    Command::new("cargo")
        .args(&["add", "tokio"])
        .output()
        .expect("failed to execute process");
    
    Command::new("cargo")
        .args(&["add", "substring"])
        .output()
        .expect("failed to execute process");

    Command::new("cargo")
        .args(&["add", "base64"])
        .output()
        .expect("failed to execute process");

        Command::new("cargo")
        .args(&["add", "async-recursion"])
        .output()
        .expect("failed to execute process");

    Command::new("cargo")
        .args(&["add", "regex"])
        .output()
        .expect("failed to execute process");
    
    Command::new("cargo")
        .args(&["add", "log"])
        .output()
        .expect("failed to execute process");

    Command::new("cargo")
        .args(&["add", "env_logger"])
        .output()
        .expect("failed to execute process");

        println!("11 dependencies installed...");
}

/// Builds the exectuable
fn run_build() {
    Command::new("cargo")
        .arg("build")
        .output()
        .expect("failed to execute process");
}

/// Tests the code
pub fn run_test() {
    // Implement the run_test function here
}

/// Handles input URL files
async fn run_url(filename: &str) {

    
    let log_file  = "LOG_FILE";
    let log_level = "LOG_LEVEL";
    match enable_logging(log_file, log_level){
        Ok(()) => debug!("Successfully opened logging file", ),
        Err(e) => error!("{}, logging to stderr instead", e),
    }

    info!("Logger successfully loaded!");

    let url_list = read_url_file::read_lines(filename); // returns urls as a list of strings
    let mut repos = repo_list::RepoList::new(); // creates a RepoList object

    for repo_url in url_list { // creates a Repo object for each url and adds it to RepoList
        let (domain, data) = url_input::get_data(&repo_url);
        let mut owner = data[0].to_owned();
        let mut package = data[1].to_owned();

        if !domain.eq("npmjs") && !domain.eq("github"){
            debug!("Domain must either be npmjs or github!\n");
            continue;
        }

        if domain.eq("npmjs") {
            let github_link = match rest_api::npmjs_get_repository_link(&owner, &package).await {
                Ok(github_link) => {
                    github_link
                },
                Err(_e) => {
                    error!("{}", _e);
                    "".to_owned()
                }
            };

            if github_link.eq("") {
                // The function failed to get the github link so it returns ""
                // adds an entry
                repos.add_repo(repo_list::Repo {url: repo_url, ..Default::default()});
                continue;
            }

            let (_git_domain, git_data) = url_input::get_data(&github_link);
            owner = git_data[0].to_owned();
            package = git_data[1].to_owned();

        }
        let response = github_get_response(&owner, &package, None).await;
        // if response.is_err() {
        //     println!("ERROR ");
        //     //return Err(response.err().unwrap().to_string());
        // }
        // let response = r.clone();
        let response1 = response.clone();
        let response2 = response.clone();

        let _r2 = github_get_issue_response(&owner, &package, None).await;
        let _dependencies = get_repo_info(&owner, &package, None).await;
        // println!("Successful get responses ");
        let mut total_pull_req = match get_closed_pr_count(&owner, &package).await {
            Ok(count) => count,
            Err(_) => {
                -1
            }
        };
        let mut total_pull_req_reviewers = match get_closed_pr_reviews_count(&owner, &package, Ok(total_pull_req)).await {
            Ok(count) if count > 0 => count,
            Ok(_) | Err(_) => {
                //println!("Failed to get total closed pull requests with reviews. Trying to get total closed pull requests with comments...");
                match get_closed_pr_comments_count(&owner, &package, Ok(total_pull_req)).await {
                    Ok(count) if count > 0 => count,
                    Ok(_) | Err(_) => {
                        //println!("Failed to get total closed pull requests with comments. Setting total_pull_req_reviewers to -1");
                        -1
                    }
                }
            }
        };

        if total_pull_req_reviewers == -1 {
            total_pull_req_reviewers = 0;
        }
        if total_pull_req == -1 {
            total_pull_req = 0;
        }
        
        
        
        let opened_issues = match rest_api::github_get_open_issues(&owner , &package, response).await {
            Ok(opened_issues) => opened_issues,
            Err(_e) => {
                debug!("{}", _e);
                "0.0".to_owned()
            }
        };

        // println!("open issues: {}", opened_issues);


        let total_issues = match rest_api::github_get_total_issues(&owner , &package, _r2).await {
            Ok(total_issues) => total_issues,
            Err(_e) => {
                debug!("{}", _e);
                "0.0".to_owned()
            }
        };

        // println!("closed issues: {}", closed_issues);


        let license =  rest_api::github_get_license(&owner , &package, response1); //.await {
        
        let number_of_forks = match rest_api::github_get_number_of_forks(&owner , &package, response2).await {
            Ok(number_of_forks) => number_of_forks,
            Err(_e) => {
                debug!("{}", _e);
                "0.0".to_owned()
            }
        };

        // println!("number_of_forks: {}", number_of_forks);

        let mut version_score = metric_calculations::version_pin(_dependencies);
        if version_score == -1.0 {
            version_score = 0.0;
            error!("Failed to get version score from {}/{}", &owner, &package);
        }

        let mut adherence_score = metric_calculations::get_adherence_score(Ok(total_pull_req),Ok(total_pull_req_reviewers ));
        if adherence_score == -1.0 {
            adherence_score = 0.0;
            error!("Failed to get adherence score from {}/{}", &owner, &package);
        }

        let mut ru = metric_calculations::get_ramp_up_time(&opened_issues, &number_of_forks);
        if ru == -1.0 {
            ru = 0.0;
            error!("Failed to get ramp up time from {}/{}", &owner, &package);
        }
        let mut c = metric_calculations::get_correctness(&opened_issues);
        if c == -1.0 {
            c = 0.0;
            error!("Failed to get number of open issues from {}/{}", &owner, &package);
        }
        let mut bf = metric_calculations::get_bus_factor(&number_of_forks);
        if bf == -1.0 {
            bf =  0.0;
            error!("Failed to get number of forks from {}/{}", &owner, &package);
        }
        let mut l = metric_calculations::get_license(license.await);
        if l == -1.0 {
            l =  0.0;
            error!("Failed to get license from {}/{}", &owner, &package);
        }
        let mut rm = metric_calculations::get_responsive_maintainer(&opened_issues, &total_issues);
        if rm == -1.0 {
            rm = 0.0;
            error!("Failed to responsiveness from {}/{}", &owner, &package);
        }

        let metrics = [ru, c, bf, l, rm]; // responsive maintainer is omitted
        let o = metric_calculations::get_overall(&metrics);

        repos.add_repo(repo_list::Repo {url : repo_url, net_score : o, ramp_up : ru, correctness : c, bus_factor : bf, responsive_maintainer : rm, license : l, version_score: version_score ,adherence_score: adherence_score});
        
    }

    repos.sort_by_net_score(); // will sort the RepoList by trustworthiness. 
    repos.display(); // will print RepoList to stdout in the desired format. 
    //repos.formatoutput();
}
