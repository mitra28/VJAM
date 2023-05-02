const fs = require('fs');

function getUrlFromPackageJson() {
  /* https://piazza.com/class/lc9qx1w86k643t/post/230 
    assume the homepage URL is the github repository
    see https://github.com/nullivex/nodist/blob/master/package.json
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