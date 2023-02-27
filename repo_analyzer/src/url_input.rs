use regex::Regex;

// Returns true if there was a match to the regex
pub fn is_valid(url: &str, regex: &Regex) -> bool {
    regex.is_match(url)
}

/*
Input: "https://www.npmjs.com/package/request"
Output: (String, Vec<String>) = ("npmjs", ["package", "request"]); 

Input: "http://www.github.com/tensorflow/tensorflow"
Output: (String, Vec<String>) = ("github", ["tensorflow", "tensorflow_something"]). 
*/
// Parses a URL and returns its root domain and subdirectories
pub fn get_data(url: &str) -> (String, Vec<String>) {
    let regular_expression = Regex::new(r"^https?://(www\.)?(npmjs|github)\.com/(.+)").unwrap();
    if is_valid(url, &regular_expression) {
        // Returns all groups the regex captured in the URL
        let matches = regular_expression.captures(url).unwrap();
        // Root Domain (Group 2) (github or npmjs)
        let domain = &matches[2];
        // Subdirectories (Group 3) (subfolders/packages)
        let subdirs = &matches[3];
        let split = subdirs.split("/").map(|s| s.to_owned()).collect::<Vec<String>>();
        
        return (domain.to_owned(), split);
    } else {
        // returns an empty string for both expected arguments
        return ("".to_string(), vec!["".to_string(); 2]);
    }
}
