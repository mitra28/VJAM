use std::{env};
use std::str;
use std::env::VarError;
use std::collections::HashMap;
use std::result::{Result};
use serde_json::json;
//use base64::decode;
use reqwest::{Client, Response};
use reqwest::header::HeaderMap;
extern crate base64;
///
/// Returns the github link associated with the npmjs package
///
/// # Arguments
///
/// * 'url' - The full npmjs url you want the associated github link of
///
// Retrieves the GitHub link for a npmjs package
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
    // println!("{:#?}", json_obj);
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

    // Retrieves the Github URL in the API's return json object "repository" field
    // let t = json_obj.get("collected").unwrap()
    //                         .get("metadata").unwrap()
    //                         .get("links").unwrap()
    //                         .get("repository").unwrap()
    //                         .as_str().unwrap();

    // println!("{}", t);
    Ok(repo_link_str.to_owned())
}


pub async fn github_get_codebase_length(owner: &str, repository: &str, response_res:  Result<serde_json::Value, String>) -> Result<String, String> {
    //let response_res = github_get_response_body(owner, repository, None).await;
    /*
    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string())
    }
    */
    let response = response_res.unwrap();

    // println!("{:#?}", response);

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


pub async fn github_get_open_issues(owner: &str, repository: &str,  response_res: Result<serde_json::Value, String>) -> Result<String, String> {


    //let response_res = github_get_response_body(owner, repository, None).await;
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

pub async fn github_get_number_of_forks(owner: &str, repository: &str, response_res: Result<serde_json::Value, String>) -> Result<String, String> {
    println!("Getting fork information for {} / {}", owner, repository);

    //let response_res = github_get_response_body(owner, repository, None).await;
    /*
    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string())
    }
    */
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

pub async fn github_get_license(owner: &str, repository: &str, response_res: Result<serde_json::Value, String>) -> Result<String, String> { // -> Result<String, String> {
    //println!("Getting license information for {} / {}", owner, repository);
    //defining map of valid licenses
    let mut valid_license = HashMap::new();
    valid_license.insert("apache", 0.0);
    valid_license.insert("mit", 1.0);
    valid_license.insert("gpl", 1.0);
    valid_license.insert("lgpl", 1.0);
    valid_license.insert("ms-pl", 1.0);
    valid_license.insert("epl", 0.0);
    valid_license.insert("bsd", 1.0);
    valid_license.insert("cddl", 0.0);


    let contents_response = response_res.unwrap();
    let license_res = contents_response.get("license");

    /*


    if license_res.is_none() || (license_res.unwrap_or(&json!("")).is_null()) {
        //if it is not in the main repo page, make another get request, this time get the readME to search for license
        let readme_path = repository.clone().to_owned() + "/contents/README.md";
        let readme_res = github_get_response_body(owner, &readme_path, None).await;
        if readme_res.is_err() {
            println!("ERROR ");
        }

        let readme = readme_res.unwrap();
        let content = readme["content"].as_str().unwrap();
        //println!("readme_res : {:?}", content);
        //let decoded_content = base64::decode(readme["content"].as_str().unwrap()).unwrap();
        let bytes = general_purpose::STANDARD
        .decode(content).unwrap();
        println!("{:?}", bytes);
        //let readme_str = String::from_utf8(bytes).unwrap();
        return "Error".to_string()

        //println!("readme_res : {:?}", readme_bytes);
        //
    }else{
        let license_name = license_res.expect("License not found").get("key").unwrap();
        let my_str = license_name.as_str().expect("Invalid license name");
        Ok(my_str.to_string());
        println!("License name: {}", my_str);
    }*/
    let license_name = license_res.expect("License not found").get("key").unwrap();
    let my_str = license_name.as_str().expect("Invalid license name");
    //println!("License name: {}", my_str);
    Ok(my_str.to_string())
    

    //works till here, checks to see if license exists in home page, if it does, it gives it a score based on that



    /*let contents_arr_res = contents_response.as_array();
    if contents_arr_res.is_none() {
        return Err(format!("Failed to get contents of Github repository: {}/{}", owner, repository));
    }
    
    if !contents_response.is_array() {
        return Err("Unexpected response format from GitHub API".to_string());
    }

    let contents_arr = contents_response.as_array().unwrap();
    //let contents_arr = contents_arr_res.unwrap();
    //println!("Contents response res: {:?}", contents_arr);

    let license_res = github_get_license_from_contents_response(owner, repository, contents_arr).await;

    if license_res.is_err() {
        return Err(format!("Failed to get license from repository: {}/{}", owner, repository));
    }
    let license = license_res.unwrap();



    Ok(license) */
}




///
/// # Info
/// Returns a HashMap<String, String> with the following keys:
///
/// key
///
/// documentation_length:       The length of the documentation in lines (excluding blank lines).
///
/// codebase_length:            The length of the codebase in lines (excluding blank lines).
///
/// num_closed_bugs_month:      The number of closed bugs in the last month.
///
/// num_opened_issues_month:    The number of opened issues in the last month.
///
/// license:                    The name of the license the repository is using.
///
///
/// # Arguments
///
/// * owner: &str -             The username of the owner of the target repository
///
/// * repository: &str -        The name of the repository
///
// pub async fn github_get_metrics(owner: &str, repository: &str) -> Result<HashMap<String, String>, String> {
// // metrics:
// // license - not done
// // codebase_length - done
// // readme - not done
// // open_issues - done

//     let mut metrics: HashMap<String, String> = HashMap::new();
//     let commits_path = format!("{}/commits", repository);
//     let contents_path = format!("{}/contents", repository);


//     // get codebase length
//     let response_res = github_get_response_body(owner, repository, None).await;
//     if response_res.is_err() {
//         return Err(response_res.err().unwrap().to_string())
//     }
//     let response = response_res.unwrap();


//     let codebase_length_res = response.get("size");
//     if codebase_length_res.is_none() {
//         return Err(format!("Failed to get codebase size of {}/{}", owner, repository));
//     }
//     let codebase_length_val = codebase_length_res.unwrap().as_i64();
//     if codebase_length_val.is_none() {
//         return Err(format!("Failed to get codebase size of {}/{}", owner, repository));
//     }
//     metrics.insert(String::from("codebase_length"), format!("{}", codebase_length_val.unwrap()));


//     // get # opened issues
//     let open_issues_res = response.get("open_issues_count");
//     if open_issues_res.is_none() {
//         return Err(format!("Failed to get number of open issues of {}/{}", owner, repository));
//     }

//     let open_issues_val = open_issues_res.unwrap().as_i64();
//     if open_issues_val.is_none() {
//         return Err(format!("Failed to get number of open issues of {}/{}", owner, repository));
//     }

//     metrics.insert(String::from("open_issues"), format!("{}", open_issues_val.unwrap()));


//     // get # commits
//     let commits_response_res = github_get_response_body(owner, &commits_path, None).await;
//     if commits_response_res.is_err() {
//         return Err(commits_response_res.err().unwrap().to_string());
//     }

//     let commits_response = commits_response_res.unwrap();
//     let commits_arr_res = commits_response.as_array();
//     if commits_arr_res.is_none() {
//         return Err(format!("Failed to get number of commits of {}/{}", owner, repository));
//     }
//     let commits_arr = commits_arr_res.unwrap();


//     // get license / README
//     let contents_response_res = github_get_response_body(owner, &contents_path, None).await;
//     if contents_response_res.is_err() {
//         return Err(contents_response_res.unwrap_err().to_string());
//     }
//     let contents_response = contents_response_res.unwrap();
//     let contents_arr_res = contents_response.as_array();
//     if contents_arr_res.is_none() {
//         return Err(format!("Failed to get contents of Github repository: {}/{}", owner, repository));
//     }

//     let contents_arr = contents_arr_res.unwrap();

//     let license_res = github_get_license_from_contents_response(owner, repository, contents_arr).await;
//     if license_res.is_err() {
//         return Err(license_res.err().unwrap().to_string())
//     }
//     let license_str = license_res.unwrap();
//     let readme_res = github_get_readme_from_contents_response(owner, repository, contents_arr);
//     if readme_res.is_err() {
//         return Err(readme_res.err().unwrap().to_string());
//     }
//     let readme_str = readme_res.unwrap();
//     // TODO: convert contents from base64 to ascii then find line count
//     let readme_len = 0;

//     metrics.insert(String::from("license"), String::from(license_str));
//     metrics.insert(String::from("readme_len"), format!("{}", readme_len));

//     Ok(metrics)
// }


///
/// Returns the response body as a serde_json::Value
///
/// # Arguments
///
pub async fn github_get_response_body(owner: &str, repository: &str, headers: Option<HeaderMap>) -> Result<serde_json::Value, String> {
    let response_res = github_get_response(owner, repository, headers).await;

    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string());
    }
    let response = response_res.unwrap();

    // println!("{:#?}", response);
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


///
/// Returns the StatusCode of a request to a Github repository
///
/// # Arguments
///
/// * 'owner'      :&str - The username of the owner of the repository
/// * 'repository' :&str - The name of the repository
///
// pub async fn github_get_status(owner: &str, repository: &str) -> Result<StatusCode, String> {
//     let response_res = github_get_response(owner, repository, None).await;
//     if response_res.is_err() {
//         return Err(response_res.err().unwrap().to_string());
//     }
//     Ok(response_res.unwrap().status().to_owned())
// }


///
/// Returns the Response object from a github url
///
/// # Arguments
///
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
    // std::thread::sleep(time::Duration::from_millis(10));
    let response_res = request_builder.send().await;
    if response_res.is_err() {
        return Err(response_res.err().unwrap().to_string());
    }
    let response = response_res.unwrap();
    // println!("{:#?}", response);
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
        //println!("${} is not set in Enviromental Variables", name);
        return Err(res.err().unwrap())
    }
    Ok(res.unwrap())
}

// returns a string with the name of the license if it is found
// returns a blank string if no license is found
/*
async fn github_get_license_from_contents_response(owner: &str, repository: &str, content_arr: &Vec<serde_json::Value>) -> Result<String, String> {
    // this function assumes that the content_arr passed to it is an array of object which contain information on files in the repository

    // println!("{:#?}",content_arr);
    // println!("{}",owner);
    // println!("{}",repository);

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

        // STEP 1.4: If prev steps were unsuccessful, look for license names in files

        // println!("{}", name);

    }

    //
    // STEP 2: Find and return the license type
    //
    if !license_in_filename {
        // STEP 2.1: if license name is located in a file, get the file contents, convert from base64, then find the license

        // get file contents
        // println!("license file: {}", license_file);
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

    } else {
        // STEP 2.2: if license name is in the file name, extract it.

    }

    // if the code reaches this line, a license was not found
    // println!("{:#?}", content_arr);
    Ok("license not implemented yet".to_owned())
}*/

// returns a blank string if no license is found
// fn github_get_readme_from_contents_response(_owner: &str, repository: &str, content_arr: &Vec<serde_json::Value>) -> Result<String, Box<dyn Error>> {

//     // look for 'readme', 'readme.txt', or 'readme.md'
//     //
//     for file_val in content_arr {
//         let _file_res = file_val.as_str();
//     }


//     Ok("readme not implemented yet".to_owned())
// }

//
// fn errorlog(error: &str) -> Box<dyn Error> {
//     println!("error");
//     Err(Box::new())
// }