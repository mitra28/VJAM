//! Handles interaction with the npm and github REST APIs

use std::{env};
use std::str;
use std::env::VarError;
use std::result::{Result};
use reqwest::{Client, Response};
use reqwest::header::HeaderMap;
use log::{ debug };
extern crate base64;
use serde_json::Value::Object;

///
/// Returns the github link associated with the npmjs package

///
/// # Arguments
///
/// * 'repository' - The full npmjs repository you want the associated github link of
/// * '_owner' - Unused argument
///
pub async fn npmjs_get_repository_link(_owner: &str, repository: &str) -> Result<String, String> {
    // docs of the api to call to get the github link
    // https://api-docs.npms.io/#api-Package

    let request_url_str = format!("https://api.npms.io/v2/package/{repository}", repository=repository);

    let client = Client::new();
    // Send a GET request to the NPM's API URL
    let res = client
        .get(request_url_str)
        .send().await;
    if res.is_err() {
        return Err(res.unwrap_err().to_string());
    }
    let res_ = res.unwrap();

    let result_text_res = res_.text().await;
    if result_text_res.is_err() {
        return Err(result_text_res.unwrap_err().to_string());
    }

    let result_text = result_text_res.unwrap().to_owned();

    let json_obj_res = serde_json::from_str(&result_text);
    if json_obj_res.is_err() {
        return Err(json_obj_res.unwrap_err().to_string());
    }

    let json_obj: serde_json::Value = json_obj_res.unwrap();
    let json_collected_res = json_obj.get("collected");
    if json_collected_res.is_none() {
        return Err(format!("Failed to get repository link from npmjs package{}", repository));
    }
    let json_metadata_res = json_collected_res.unwrap().get("metadata");
    if json_metadata_res.is_none() {
        return Err(format!("Failed to get repository link from npmjs package{}", repository));
    }
    let json_links_res = json_metadata_res.unwrap().get("links");
    if json_links_res.is_none() {
        return Err(format!("Failed to get repository link from npmjs package{}", repository));
    }
    let json_repository_res = json_links_res.unwrap().get("repository");
    if json_repository_res.is_none() {
        return Err(format!("Failed to get repository link from npmjs package{}", repository));
    }
    let repo_link_res = json_repository_res.unwrap().as_str();
    if repo_link_res.is_none() {
        return Err(format!("Failed to get repository link from npmjs package{}", repository));
    }
    let repo_link_str = repo_link_res.unwrap();

    if !repo_link_str.contains("github.com") {
        return Err(format!("Failed to retrieve a Github link from npmjs package{}", repository));
    } 

    Ok(repo_link_str.to_owned())
}


/// Returns the length of a repository
///
/// # Arguments
///
/// * 'owner' - The owner of the repository
/// * 'repository' - The repository
/// * 'response_res' - The response request to parse
///
pub async fn github_get_codebase_length(owner: &str, repository: &str) -> Result<String, String> {
    println!("Getting ramp up information for {} / {}", owner, repository);
    let response_res = github_get_response_body(owner, repository, None).await;
    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string())
    }
    let response = response_res.unwrap();

    let open_issues_res = response.get("open_issues");
    let forks_res = response.get("forks");
    if open_issues_res.is_none() {
        return Err(format!("Failed to get number of open issues of {}/{} for ramp-up", owner, repository));
    }
    if forks_res.is_none() {
        return Err(format!("Failed to get number of forks of {}/{} for ramp-up", owner, repository));
    }

    let open_issues_val = open_issues_res.unwrap().as_i64();
    let forks_val = forks_res.unwrap().as_i64();
    if open_issues_val.is_none() {
        return Err(format!("Failed to unwrap number of open issues of {}/{} for ramp-up", owner, repository));
    }
    if forks_val.is_none() {
        return Err(format!("Failed to unwrap number of forks of {}/{} for ramp-up", owner, repository));
    }
    //let ratio = open_issues_val.unwrap()/forks_val.unwrap();
    Ok(format!("{},{}", open_issues_val.unwrap(), forks_val.unwrap()))
    //Ok(format!("{}", ratio))
}



/// Returns the number of open issues of a repository

///
/// # Arguments
///
/// * 'owner' - The owner of the repository
/// * 'repository' - The repository
/// * 'response_res' - The response request to parse
///
pub async fn github_get_open_issues(owner: &str, repository: &str,  response_res: Result<serde_json::Value, String>) -> Result<String, String> {
    println!("Getting open issues information for {} / {}", owner, repository);
    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string())
    }
    let response = response_res.unwrap();

    let open_issues_res = response.get("open_issues_count");
    if open_issues_res.is_none() {
        return Err(format!("Failed to get number of open issues of {}/{}", owner, repository));
    }

    let open_issues_val = open_issues_res.unwrap().as_i64();
    if open_issues_val.is_none() {
        return Err(format!("Failed to get number of open issues of {}/{}", owner, repository));
    }

    Ok(format!("{}", open_issues_val.unwrap()))

}

/// Returns the number of closed issues of a repository
///
/// # Arguments
///
/// * 'owner' - The owner of the repository
/// * 'repository' - The repository
/// * 'response_res' - The response request to parse
///
pub async fn github_get_closed_issues(owner: &str, repository: &str, response_res: Result<serde_json::Value, String>) -> Result<String, String> {
    println!("Getting number issues information for {} / {}", owner, repository);

    //let response_res = github_get_response_body(owner, repository, None).await;
    
    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string())
    }
    let response = response_res.unwrap();

    debug!("{}", response.to_string());

    let issues_res = response.get("number");
    if issues_res.is_none() {
        return Err(format!("Failed to get number of issues of {}/{}", owner, repository));
    }

    let issues_val = issues_res.unwrap().as_i64();
    if issues_val.is_none() {
        return Err(format!("Failed to get number of issues of {}/{}", owner, repository));
    }
    
    Ok(format!("{}", issues_val.unwrap()))
}

pub async fn github_get_number_of_forks(owner: &str, repository: &str, response_res: Result<serde_json::Value, String>) -> Result<String, String> {
    println!("Getting fork information for {} / {}", owner, repository);

    let response = response_res.unwrap();

    let forks_res = response.get("forks");
    if forks_res.is_none() {
        return Err(format!("Failed to get number of open issues of {}/{}", owner, repository));
    }

    let forks_val = forks_res.unwrap().as_i64();
    if forks_val.is_none() {
        return Err(format!("Failed to get number of open issues of {}/{}", owner, repository));
    }

    Ok(format!("{}", forks_val.unwrap()))

}

/// Returns the license of a repository
pub async fn github_get_license(owner: &str, repository: &str, response_res: Result<serde_json::Value, String>) -> Result<String, String> {
    println!("Getting license information for {} / {}", owner, repository);

    let contents_response = response_res.unwrap();
    let license_res = contents_response.get("license");

    match license_res.unwrap() {
        Object(json) => {
            let license_name = json.get("key").expect("Key: \"key\" is not in the response text");
            let my_str = license_name.as_str().expect("Invalid license name");
            Ok(my_str.to_string())        
        }
        _ => {
            Err("".to_string())
        }
    }
}

/// Returns the response body as a serde_json::Value
pub async fn github_get_response_body(owner: &str, repository: &str, headers: Option<HeaderMap>) -> Result<serde_json::Value, String> {
    let response_res = github_get_response(owner, repository, headers).await;

    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string());
    }
    let response = response_res.unwrap();

    let response_text_res = response.text().await;

    if response_text_res.is_err() {
        return Err(response_text_res.err().unwrap().to_string())
    }

    let response_text = response_text_res.unwrap().to_owned();
    let response_json_res = serde_json::from_str(&response_text);
    if response_json_res.is_err() {
        return Err(response_json_res.err().unwrap().to_string())
    }
    let response_json = response_json_res.unwrap();
    //println!("response JSON : {:?}", response_json);

    Ok(response_json)
    //return response_json;
}



/// Returns the Response object from a github url
pub async fn github_get_response(owner: &str, repository: &str, headers: Option<HeaderMap>) -> Result<Response, String> {
    let mut owner_mut = String::from(owner);
    let mut repo_mut = String::from(repository);
    if !owner.is_empty() {
        owner_mut.insert(0, '/')
    }
    if !repository.is_empty() {
        repo_mut.insert(0, '/');
    }
    let url = format!("https://api.github.com/repos{}{}", owner_mut, repo_mut);
    println!("URL:  {}", url);
    let token_res = github_get_api_token();
    if token_res.is_err() {
        return Err(token_res.err().unwrap().to_string());
    }
    let token = token_res.unwrap();

    let client_id = "";
    let client_secret = "";


    let client = Client::new();
    let mut request_builder = client
        .get(url)
        .header("Authorization", token)
        .header("client_id", client_id)
        .header("client_secret", client_secret)
        .header("User-Agent", "ECE461-repository-analyzer");
    if headers.is_some() {
        request_builder = request_builder.headers(headers.unwrap());
    }
    let response_res = request_builder.send().await;
    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string());
    }
    let response = response_res.unwrap();
    Ok(response)
}

pub async fn github_get_issue_response(owner: &str, repository: &str, headers: Option<HeaderMap>) -> Result<Response, String> {
    let mut owner_mut = String::from(owner);
    let mut repo_mut = String::from(repository);
    if !owner.is_empty() {
        owner_mut.insert(0, '/')
    }
    if !repository.is_empty() {
        repo_mut.insert(0, '/');
    }
    let url = format!("https://api.github.com/repos{}{}/issues/", owner_mut, repo_mut);
    let token_res = github_get_api_token();
    if token_res.is_err() {
        return Err(token_res.err().unwrap().to_string());
    }
    let token = token_res.unwrap();

    let client_id = "";
    let client_secret = "";


    let client = Client::new();
    let mut request_builder = client
        .get(url)
        .header("Authorization", token)
        .header("client_id", client_id)
        .header("client_secret", client_secret)
        .header("User-Agent", "ECE461-repository-analyzer");
    if headers.is_some() {
        request_builder = request_builder.headers(headers.unwrap());
    }
    let response_res = request_builder.send().await;
    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string());
    }
    let response = response_res.unwrap();
    
    Ok(response)
}

pub async fn github_get_issue_response_body(owner: &str, repository: &str, headers: Option<HeaderMap>) -> Result<serde_json::Value, String> {
    let response_res = github_get_issue_response(owner, repository, headers).await;

    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string());
    }
    let response = response_res.unwrap();

    let response_text_res = response.text().await;

    if response_text_res.is_err() {
        return Err(response_text_res.err().unwrap().to_string())
    }

    let response_text = response_text_res.unwrap().to_owned();
    let response_json_res = serde_json::from_str(&response_text);
    if response_json_res.is_err() {
        return Err(response_json_res.err().unwrap().to_string())
    }

    let response_json: serde_json::Value = response_json_res.unwrap();

    // let issues_count = response_json["number"].as_u64().unwrap_or(0);
    // println!("\n\nNumber of total issues: {}\n\n", issues_count);

    //let response_json: serde_json::Value = response_json_res.unwrap();

    //println!("\n\nresponse: {}\n\n", response_json);
    //let issues_count = response_json["number"].as_u64().unwrap_or(0);
    //println!("\n\nNumber of total issues: {}\n\n", issues_count);

    Ok(response_json)
}



//////////////////////////
////                  ////
//// helper functions ////
////                  ////
//////////////////////////


fn github_get_api_token() -> Result<String, VarError> {
    let name = "GITHUB_TOKEN";
    let res = env::var(name);
    if res.is_err() {
        return Err(res.err().unwrap())
    }
    Ok(res.unwrap())
}