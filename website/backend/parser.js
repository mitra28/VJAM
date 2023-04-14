const fs = require('fs');

function getUrlFromPackageJson() {
  /* https://piazza.com/class/lc9qx1w86k643t/post/230 
    assume the homepage URL is the github repository
  */

  // check for package.json; if it doesnt exist return bad request

  // open the package.json file for parsing
  const packageJson = fs.readFileSync('package.json'); // package.json is in same directory as this file
  const data = JSON.parse(packageJson);

  // check if repository field & repository url field (ex. browsify, cloudinary)
  if (data.homepage) {
    let url = data.homepage;
    if (url.includes('github.com')) {
      return url;
    }
  }
  return undefined;
}


/*
// check if repository field & repository url field (ex. browsify, cloudinary)
  if (data.repository && data.repository.url) {
    let url = data.repository.url;
    if (url.endsWith('.git')) {
      url = url.substring(0, url.length - 4);
    }
    return url;
  }
  else if (data.repository){
    // verifyOwnerRepo(data.repository)
    let url = "https://github.com/" + data.repository;
    return url;
  }

*/