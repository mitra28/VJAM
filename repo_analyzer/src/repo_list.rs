//! Contains the [Repo] and [RepoList] structs used to store information about repositories

use std::vec::Vec;
use std::default::Default;

/// Struct to contain information about a Repository
pub struct Repo{
    /// The original url of the repository
    pub url: String,

    /// The net score metric
    pub net_score: f32,

    /// The ramp up time metric
    pub ramp_up: f32,

    /// The correctness metric
    pub correctness: f32,

    /// The bus factor metric
    pub bus_factor: f32,

    /// The responsive maintainer metric
    pub responsive_maintainer: f32,

    /// The license metric
    pub license: f32,

    /// The version pinning metric
    pub version_score: f32,

    /// The adherence to engineering principles metric
    pub adherence_score: f32,
}

/// Default behavior for Repo
impl Default for Repo {
    fn default() -> Self {
        Repo {
            url: String::new(),
            net_score: 0.0,
            ramp_up: 0.0,
            correctness: 0.0,
            bus_factor: 0.0,
            responsive_maintainer: 0.0,
            license: 0.0,
            version_score: 0.0,
            adherence_score: 0.0,
        }
    }
}

/// Struct used to store a list of [Repo]s
pub struct RepoList {
    /// stores a [Vec] of [Repo]s
    pub repos: Vec<Repo>,
}

/// Implements several functions for [RepoList]
impl RepoList {
    /// Creates an empty vector of to store [Repo]s within [RepoList.repos]
    pub fn new() -> RepoList {
        RepoList { repos: Vec::new() }
    }

    /// Adds a [Repo] to the [RepoList.repos]
    pub fn add_repo(&mut self, repo: Repo) {
        self.repos.push(repo);
    }

    /// Implements sorting a populated [RepoList.repos] by [Repo.net_score] in descending order
    pub fn sort_by_net_score(&mut self) {
        self.repos.sort_by(|a, b| b.net_score.partial_cmp(&a.net_score).unwrap());
    }

    /// Prints out the [Repo]s contained in [RepoList.repos] in NDJSON format
    pub fn display(&self) {
        for repo in &self.repos {
            println!("{{\"URL\":\"{}\", \"NET_SCORE\":{:.2}, \"RAMP_UP_SCORE\":{:.2}, \"CORRECTNESS_SCORE\":{:.2}, \"BUS_FACTOR_SCORE\":{:.2}, \"RESPONSIVE_MAINTAINER_SCORE\":{:.2}, \"LICENSE_SCORE\":{:.2}, \"VERSION_PIN_SCORE\":{:.2}, \"ADHERENCE_SCORE\":{:.2}}}", 
                repo.url, repo.net_score, repo.ramp_up, repo.correctness, repo.bus_factor, repo.responsive_maintainer, repo.license, repo.version_score, repo.adherence_score);
        }
    }
}