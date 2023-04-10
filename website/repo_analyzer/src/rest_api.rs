#![allow(unused_imports)]
//! Handles interaction with the npm and github REST APIs

use std::{env};
use std::str;
use std::env::VarError;
use std::result::{Result};
use reqwest::Client;
use reqwest::header::HeaderMap;
use log::{ debug };
extern crate base64;
use serde_json::Value;
use std::collections::HashSet;

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



/// All functions starting with "github_get" have the following arguments:
///
/// # Arguments
///
/// * 'owner' - The owner of the repository
/// * 'repository' - The repository
/// * 'response_res' - The response request to parse
///

//function to retrieve the list of pull requests.Result<serde_json::Value, String>

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
//Version pinning. DONE

pub async fn get_repo_info(owner: &str, repo: &str, headers: Option<&HeaderMap>) -> Result<Vec<(String, String)>, Box<dyn std::error::Error>> {
    let url = format!("https://api.github.com/repos/{}/{}/contents/", owner, repo);
    let token_res = github_get_api_token();
    let token = token_res?;
    let client = Client::new();
    let mut request_builder = client.get(&url)
        .header("Authorization", format!("Bearer {}", token))
        .header("User-Agent", "ECE461-repository-analyzer");
    if let Some(header_map) = headers {
        request_builder = request_builder.headers(header_map.clone());
    }

    let response = request_builder.send().await?.text().await?;
    let response_json: Vec<Value> = serde_json::from_str(&response)?;

    let mut result = Vec::new();

    for item in response_json {
        if let Some(name) = item.get("name").and_then(Value::as_str) {
            if name == "package.json" || name == "requirements.txt" {
                let download_url = item
                    .get("download_url")
                    .and_then(Value::as_str)
                    .ok_or_else(|| format!("Download URL not found for file {}", name))?;

                let file_response = client
                    .get(download_url)
                    .header("Authorization", format!("Bearer {}", token))
                    .header("User-Agent", "ECE461-repository-analyzer")
                    .send()
                    .await?;

                let file_text = file_response.text().await?;
                let dependencies = get_major_minor_dependencies(&file_text)?;
                result.extend(dependencies);
            }
        }
    }
    //println!("The value of result is {:?}", result);
    Ok(result)
}

fn get_major_minor_dependencies(file_text: &str) -> Result<Vec<(String, String)>, Box<dyn std::error::Error>> {
    let package_json: Value = serde_json::from_str(&file_text)?;
    let dependencies = package_json["dependencies"].as_object().ok_or(" ")?;
    let mut result = Vec::new();
    for (name, version) in dependencies {
        if let Some(version_str) = version.as_str() {
            let parts: Vec<&str> = version_str.split('.').collect();
            if parts.len() >= 2 {
                result.push((name.to_string(), format!("{}.{}", parts[0], parts[1])));
            }
        }
    }
    Ok(result)
}
//Graph QL

/// Gets the total count of closed PRs
pub async fn get_closed_pr_count(owner: &str, repo: &str) -> Result<i32, String> {
    // Construct the GraphQL query to get the total number of closed pull requests
    let token_res = github_get_api_token();
    if token_res.is_err() {
        println!("failed to get token");
        return Err(token_res.err().unwrap().to_string());
    }
    let token = token_res.unwrap();

    let query = format!(
        r#"
        query {{
            repository(owner:"{}", name:"{}") {{
                pullRequests(states:CLOSED) {{
                    totalCount
                }}
            }}
        }}
        "#,
        owner, repo
    );

    // Send the GraphQL query to the GitHub API
    let client = reqwest::Client::new();
    let response = match client
        .post("https://api.github.com/graphql")
        .header("Authorization", format!("Bearer {}", token))
        .header("User-Agent", "ECE461-repository-analyzer")
        .json(&serde_json::json!({ "query": query }))
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) =>{
            println!("error getting response");
            return Err(format!("Error sending GraphQL request: {}", e));
        } 
    };

    // Parse the response and extract the total count of closed pull requests
    let json: serde_json::Value = match response.json().await {
        Ok(val) => val,
        Err(e) => {
            println!("error parsing response");
            return Err(format!("Error parsing GraphQL response: {}", e));
        }
    };
    let count = match json["data"]["repository"]["pullRequests"]["totalCount"].as_u64() {
        Some(val) => val as i32,
        None => -1,
    };

    Ok(count)
}

/// Gets the totals closed PR reviews count
pub async fn get_closed_pr_reviews_count(owner: &str, repo: &str, total_closed: Result<i32, String>) -> Result<i32, String> {
    let min_reviewers = 2;
    let closed_pr_count = match total_closed {
        Ok(count) => count,
        Err(e) => return Err(e),
    };
    let mut pr_urls = HashSet::new();
    let num_pages = (closed_pr_count + 99) / 100;
    for _page in 1..=num_pages {
        let after = if pr_urls.is_empty() {
            "null".to_owned()
        } else {
            format!("\"{}\"", pr_urls.iter().last().unwrap())
        };
        let pr_query = format!(
            r#"
            query {{
              repository(owner: "{}", name: "{}") {{
                pullRequests(states: CLOSED, first: 100, after: {}, orderBy: {{field: UPDATED_AT, direction: DESC}}) {{
                  pageInfo {{
                    endCursor
                    hasNextPage
                  }}
                  nodes {{
                    url
                    reviews(first: 10) {{
                      nodes {{
                        author {{
                          login
                        }}
                      }}
                    }}
                  }}
                }}
              }}
            }}
            "#,
            owner,
            repo,
            after,
        );
        let pr_response = send_graphql_request(&pr_query).await?;
        let pr_data: serde_json::Value = serde_json::from_str(&pr_response).map_err(|err| err.to_string())?;

        //let pr_nodes = pr_data["data"]["repository"]["pullRequests"]["nodes"].as_array().unwrap();
        let pr_nodes = match pr_data["data"]["repository"]["pullRequests"]["nodes"].as_array() {
            Some(nodes) => nodes,
            None => return Err("Missing 'nodes' array in pull request data".to_owned()),
        };
        for pr in pr_nodes {
            //let pr_url = pr["url"].as_str().unwrap().to_owned();
            let pr_url = pr["url"].as_str().ok_or_else(|| "Missing 'url' field in pull request data")?.to_owned();
            let mut reviewers = HashSet::new();
            if let Some(reviews) = pr["reviews"]["nodes"].as_array() {
                for review in reviews {
                    if let Some(login) = review["author"]["login"].as_str() {
                        reviewers.insert(login.to_owned());
                    } else {
                        return Err("Missing 'login' field in review data".to_owned());
                    }
                }
            }

            if reviewers.len() >= min_reviewers {
                pr_urls.insert(pr_url);
            }
        }

        if !pr_data["data"]["repository"]["pullRequests"]["pageInfo"]["hasNextPage"].as_bool().unwrap() {
            break;
        }
    }
    Ok(pr_urls.len() as i32)
}


async fn send_graphql_request(query: &str) -> Result<String, String> {
    let token_res = github_get_api_token();
    if token_res.is_err() {
        return Err(token_res.err().unwrap().to_string());
    }
    let token = token_res.unwrap();

    let client = reqwest::Client::new();
    let response = client
        .post("https://api.github.com/graphql")
        .header("Authorization", format!("Bearer {}", token))
        .header("User-Agent", "ECE461-repository-analyzer")
        .json(&serde_json::json!({ "query": query }))
        .send()
        .await
        .map_err(|err| err.to_string())?;

    let response_text = response.text().await.map_err(|err| err.to_string())?;
    Ok(response_text)
}

/// Gets closed PR comment count
pub async fn get_closed_pr_comments_count(owner: &str, repo: &str, total_closed: Result<i32, String>) -> Result<i32, String> {
    let min_comments = 2;
    let closed_pr_count = match total_closed {
        Ok(count) => count,
        Err(e) => return Err(e),
    };
    let mut pr_urls = HashSet::new();
    let num_pages = (closed_pr_count + 99) / 100;
    for _page in 1..=num_pages {
        let after = if pr_urls.is_empty() {
            "null".to_owned()
        } else {
            format!("\"{}\"", pr_urls.iter().last().unwrap())
        };
        let pr_query = format!(
            r#"
            query {{
              repository(owner: "{}", name: "{}") {{
                pullRequests(states: CLOSED, first: 100, after: {}, orderBy: {{field: UPDATED_AT, direction: DESC}}) {{
                  pageInfo {{
                    endCursor
                    hasNextPage
                  }}
                  nodes {{
                    url
                    comments(first: 10) {{
                      totalCount
                    }}
                  }}
                }}
              }}
            }}
            "#,
            owner,
            repo,
            after,
        );
        let pr_response = send_graphql_request(&pr_query).await?;
        let pr_data: serde_json::Value = serde_json::from_str(&pr_response).map_err(|err| err.to_string())?;

        let pr_nodes = match pr_data["data"]["repository"]["pullRequests"]["nodes"].as_array() {
            Some(nodes) => nodes,
            None => return Err("Missing 'nodes' array in pull request data".to_owned()),
        };
        for pr in pr_nodes {
            let pr_url = pr["url"].as_str().ok_or_else(|| "Missing 'url' field in pull request data")?.to_owned();
            let comments_count = pr["comments"]["totalCount"].as_i64().ok_or_else(|| "Missing 'totalCount' field in comments data")?;

            if comments_count >= min_comments {
                pr_urls.insert(pr_url);
            }
        }

        if !pr_data["data"]["repository"]["pullRequests"]["pageInfo"]["hasNextPage"].as_bool().unwrap() {
            break;
        }
    }

    Ok(pr_urls.len() as i32)
}



/// Returns the number of open issues of a repository
///
pub async fn github_get_open_issues(owner: &str, repository: &str,  response_res: Result<serde_json::Value, String>) -> Result<String, String> {
    // println!("Getting open issues information for {} / {}", owner, repository);
    
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

/// Returns the number of total issues of a repository
///

pub async fn github_get_total_issues(owner: &str, repository: &str, response_res: Result<serde_json::Value, String>) -> Result<String, String> {
    // println!("Getting number issues information for {} / {}", owner, repository);

    let response = response_res.unwrap();

    //debug!("{}", response.to_string());

    let issues_res = response[0].get("number");
    if issues_res.is_none() {
        return Err(format!("Failed to get number of issues of {}/{}", owner, repository));
    }

    let issues_val = issues_res.unwrap().as_i64();
    if issues_val.is_none() {
        return Err(format!("Failed to get number of issues of {}/{}", owner, repository));
    }
    
    Ok(format!("{}", issues_val.unwrap()))
}

/// Returns the number of total issues of a repository
///
pub async fn github_get_number_of_forks(owner: &str, repository: &str, response_res: Result<serde_json::Value, String>) -> Result<String, String> {
    // println!("Getting fork information for {} / {}", owner, repository);

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
///
pub async fn github_get_license(owner: &str, repository: &str, response_res: Result<serde_json::Value, String>) -> Result<String, String> {
    // println!("Getting license information for {} / {}", owner, repository);

    let contents_response = response_res.unwrap();
    let license_res = contents_response.get("license");

    if license_res.is_none() {
        return Err(format!("Failed to get license information of {}/{}", owner, repository));
    }

    let license_key = contents_response.get("license")
        .and_then(|license_value| license_value.get("key"))
        .ok_or(" ")?;
    
    // drop(license_key);

    let key_as_str = license_key.as_str();
    let license_key_string = match key_as_str {
        Some(s) => String::from(s),
        None => String::new(), // or handle the error however you want
    };
    
    Ok(license_key_string)
    
}

/// Returns the Response object from a github url
///
pub async fn github_get_response(owner: &str, repository: &str, headers: Option<HeaderMap>) -> Result<serde_json::Value, String> {
    let owner_mut = String::from(owner);
    let repo_mut = String::from(repository);
   
    let url = format!("https://api.github.com/repos/{}/{}", owner_mut, repo_mut);

    // println!("URL:  {}", url);
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

/// Returns the Issues response object from a github url
pub async fn github_get_issue_response(owner: &str, repository: &str, headers: Option<HeaderMap>) -> Result<serde_json::Value, String> {
    let owner_mut = String::from(owner);
    let repo_mut = String::from(repository);
    // if !owner.is_empty() {
    //     owner_mut.insert(0, '/')
    // }
    // if !repository.is_empty() {
    //     repo_mut.insert(0, '/');
    // }
    let url = format!("https://api.github.com/repos/{}/{}/issues", owner_mut, repo_mut);
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


//////////////////////////
////                  ////
//// helper functions ////
////                  ////
//////////////////////////


/// Returns authentication token from environmental variable
fn github_get_api_token() -> Result<String, VarError> {
    let name = "GITHUB_TOKEN";
    let res = env::var(name);
    if res.is_err() {
        return Err(res.err().unwrap())
    }
    Ok(res.unwrap())
}