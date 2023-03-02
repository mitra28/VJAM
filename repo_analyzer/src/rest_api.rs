//! Handles interaction with the npm and github REST APIs

use std::{env};
use std::str;
use std::env::VarError;
use std::result::{Result};
use reqwest::{Client, Response};
use reqwest::header::HeaderMap;
use base64::{ Engine, engine::general_purpose };


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


/// Returns the length of a codebase
///
/// # Arguments
///
/// * 'owner' - The owner of the repository
/// * 'repository' - The github repository you want to pull from
///
pub async fn github_get_codebase_length(owner: &str, repository: &str) -> Result<String, String> {
    let response_res = github_get_response_body(owner, repository, None).await;
    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string())
    }
    let response = response_res.unwrap();

    let codebase_length_res = response.get("size");
    if codebase_length_res.is_none() {
        return Err(format!("Failed to get codebase size of {}/{}", owner, repository));
    }
    let codebase_length_val = codebase_length_res.unwrap().as_i64();
    if codebase_length_val.is_none() {
        return Err(format!("Failed to get codebase size of {}/{}", owner, repository));
    }
    Ok(format!("{}", codebase_length_val.unwrap()))
}


/// Returns the number of open issues of a codebase
///
/// # Arguments
///
/// * 'owner' - The owner of the repository
/// * 'repository' - The github repository you want to pull from
///
pub async fn github_get_open_issues(owner: &str, repository: &str) -> Result<String, String> {


    let response_res = github_get_response_body(owner, repository, None).await;
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

/// Returns the number of forks from a codebase
///
/// # Arguments
///
/// * 'owner' - The owner of the repository
/// * 'repository' - The github repository you want to pull from
///
pub async fn github_get_number_of_forks(owner: &str, repository: &str) -> Result<String, String> {

    let response_res = github_get_response_body(owner, repository, None).await;
    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string())
    }
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

/// Returns the license of a codebase
///
/// # Arguments
///
/// * 'owner' - The owner of the repository
/// * 'repository' - The github repository you want to pull from
///
pub async fn github_get_license(owner: &str, repository: &str) -> Result<String, String> {

    let contents_path = format!("{}/contents", repository);
    let contents_response_res = github_get_response_body(owner, &contents_path, None).await;
    if contents_response_res.is_err() {
        return Err(contents_response_res.unwrap_err().to_string());
    }
    let contents_response = contents_response_res.unwrap();
    let contents_arr_res = contents_response.as_array();
    if contents_arr_res.is_none() {
        return Err(format!("Failed to get contents of Github repository: {}/{}", owner, repository));
    }

    let contents_arr = contents_arr_res.unwrap();

    let license_res = github_get_license_from_contents_response(owner, repository, contents_arr).await;

    if license_res.is_err() {
        return Err(format!("Failed to get license from repository: {}/{}", owner, repository));
    }
    let license = license_res.unwrap();
    Ok(license)
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

    Ok(response_json)
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

// returns a string with the name of the license if it is found
// returns a blank string if no license is found
async fn github_get_license_from_contents_response(owner: &str, repository: &str, content_arr: &Vec<serde_json::Value>) -> Result<String, String> {
    // this function assumes that the content_arr passed to it is an array of object which contain information on files in the repository

    // look for key words in file/dir names in base directory
    // eg.: 'license' or names of licenses
    // if there is a file called 'license' in root dir, the first words in it may be the license type.

    //
    // STEP 1: Find the file that contains the repository license
    //
    let mut license_file = String::new();
    let license_in_filename: bool = false;

    let license_word = "license";
    for file_val in content_arr {

        let file_res = file_val.as_object();
        if file_res.is_none() {
            return Err(format!("Failed to get the license of {}/{}", owner, repository))
        }
        let file = file_res.unwrap();

        // get file type
        let filetype_res = file.get("type");
        if filetype_res.is_none() {
            return Err(format!("Failed to get the license of {}/{}", owner, repository));
        }
        let filetype_val = filetype_res.unwrap().as_str();
        if filetype_val.is_none() {
            return Err(format!("Failed to get the license of {}/{}", owner, repository));
        }
        let filetype = filetype_val.unwrap();

        if filetype.to_lowercase().eq("dir") {
            // ignore directories
            continue;
        }

        // get path
        let path_res = file.get("path");
        if path_res.is_none() {
            return Err(format!("Failed to get the license of {}/{}", owner, repository));
        }
        let path_val = path_res.unwrap().as_str();
        if path_val.is_none() {
            return Err(format!("Failed to get the license of {}/{}", owner, repository));
        }
        let path = path_val.unwrap();


        let name_res = file.get("name");
        if name_res.is_none() {
            return Err(format!("Failed to get the license of {}/{}", owner, repository));
        }
        let name_val = name_res.unwrap().as_str();
        if name_val.is_none() {
            return Err(format!("Failed to get the license of {}/{}", owner, repository));
        }
        let name = name_val.unwrap();
        let name_lower = name.to_lowercase();

        // STEP 1.1: look for a file called 'license'
        if name_lower.eq(license_word) {

            license_file.push_str(path);
            break; // license file was found

        }

        // STEP 1.2: check for license.txt or license.md
        if name_lower.eq("license.txt") || name_lower.eq("license.md") {
            license_file.push_str(path);
            break; // license file was found
        }
        // STEP 1.3: check if file name contains license
        if name_lower.contains("license") {
            license_file.push_str(path);
            break; // license file was found
        }
    }

    //
    // STEP 2: Find and return the license type
    //
    if !license_in_filename {
        // STEP 2.1: if license name is located in a file, get the file contents, convert from base64, then find the license

        // get file contents
        let path = format!("{}/contents/{}", repository, license_file);
        let contents_res = github_get_response_body(owner, &path, None).await;
        if contents_res.is_err() {
            return Err(contents_res.err().unwrap());
        }
        let contents_val = contents_res.unwrap();
        let contents_obj = contents_val.as_object();
        if contents_obj.is_none() {
            return Err(format!("Failed to get license from filename for {}/{}", owner, repository));
        }
        let contents = contents_obj.unwrap();

        let file_contents_res = contents.get("content");
        if file_contents_res.is_none() {
            return Err(format!("Failed to get license from filename for {}/{}", owner, repository));
        }
        let file_contents_val = file_contents_res.unwrap();

        let file_contents_base64_res = file_contents_val.as_str();
        if file_contents_base64_res.is_none() {
            return Err(format!("Failed to get license from filename for {}/{}", owner, repository));
        }
        let file_contents_base64 = file_contents_base64_res.unwrap();

        // convert from base64
        let file_contents_base64_ = file_contents_base64.replace("\n", ""); // remove all new line chars from the base64 string
        let license_str = str::from_utf8(&*general_purpose::STANDARD.decode(&file_contents_base64_).unwrap()).unwrap().to_owned();

        // find the license
        let license_lines: Vec<&str> = license_str.split("\n").collect();
        let license_name = String::from(license_lines[0].trim());
        // println!("{}", license_name);
        return Ok(license_name.clone());
    } 

    // if the code reaches this line, a license was not found
    Ok("license not implemented yet".to_owned())
}

