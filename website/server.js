
const express = require('express');
const cors = require("cors");
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const packageRoutes = require('./backend/routes/packageroutes');
const Package = require('./backend/models/package');
const upload = multer({ dest: 'temp/' });
const formidable = require('formidable');
//const { createRepoTable } = require('../packageDirectory/database.mjs');
const PackageData = require ('./backend/models/packagedata');
const { retrieveScoreTable } = require('../packageDirectory/database.js');
// const databaseFunctions = require('../packageDirectory/database.js');
//const { deleteTable } = require('../packageDirectory/database.js');

async function main() {
  const databaseFunctions = await import('../packageDirectory/database.js');
  return databaseFunctions;
}

async function post_url(name, version, name_tag, url, zip, readme, total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score){
  const db = await main();
  const {insertScoreTable, insertMainTable, insertRepoTable,updateMainTableWithRepoScoreIds} = db;
  const score_id = await insertScoreTable(total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score);
  const repo_id = await insertRepoTable(url, zip, readme);//zip and readme null
  const main_id = await insertMainTable(name, version, name_tag);
  await updateMainTableWithRepoScoreIds(main_id, repo_id, score_id);
  console.log('post_url');
}

async function post_zip(name, version, name_tag, url, zip, readme){
  const db = await main();
  const {insertZippedString, insertMainTable, insertRepoTable,updateMainTableWithRepoScoreIds} = db;
  const repo_id = await insertRepoTable(url, zip, readme);
  // or
  //const repo_id = insertZippedString(zip);
  const main_id = await insertMainTable(name, version, name_tag);
  await updateMainTableWithRepoScoreIds(main_id, repo_id, -1);
}
async function post_list(){
  const db = await main();
  const {retrieveAllZip} = db;
  const result = await retrieveAllZip();
  return result;
}
async function delete_name(name){
  const db = await main();
  const {deleteID_name} = db;
  await deleteID_name(name);
}
async function delete_nameTag(name_tag){
  const db = await main();
  const {deleteID_nametag} = db;
  await deleteID_nametag(name_tag);
}
async function getPackage(name_tag){
  const db = await main();
  const {retrieveRepoTable, retrieveMainTableRowByNametag} = db;
  const main_row = await retrieveMainTableRowByNametag(name_tag);
  const repo_row = await retrieveRepoTable(name_tag);
  //console.log(repo_row);
  //console.log(main_row);


  //const zip_content = await retrieveZippedString(name_tag);
  return {
    main_row,
    repo_row,
  };
}
async function updatePackage(name_tag, newZip){
  const db = await main();
  const {updateZip} = db;
  const zip_content = await updateZip(name_tag, newZip);
}
async function packageRate(name_tag){
  const db = await main();
  const {retrieveScoreTable} = db;
  const result = retrieveScoreTable(name_tag);
  return result;
}
async function packageRegExGet(){
  const db = await main();
  const {retrieveAllNames} = db;
  const result = retrieveAllNames();
  return result;

}
async function getScore(name_tag){
  const db = await main();
  const { retrieveScoreTable } = db;
  const result = await retrieveScoreTable(name_tag);
  return result;
}

async function reset() {
  const db = await main();
  const { deleteTable } = db;
  await deleteTable("main_table");
  await deleteTable("score_table");
  await deleteTable("repo_table");
}
async function createTables() {
  const db = await main();
  const { createMainTable,createRepoTable,createScoreTable} = db;
  await createMainTable();
  await createRepoTable();
  await createScoreTable();
}
async function addAllTables(name, version, name_tag, url, zip, readme, total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score){
  const db = await main();
  const { insertALLTable} = db;
  insertALLTable(name, version, name_tag, url, zip, readme, total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score);
}
async function getAllTables(name_tag){
  const db = await main();
  const { retrieveAllTables} = db;
  retrieveAllTables(name_tag);
}

// reset();
// createMainTable();

const path_to_index = path.join(__dirname, '.', 'react', 'build', 'index.html');

const port = 9090; // process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/packages', packageRoutes);
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// Serve static files from the "build" directory
app.use(express.static(path.join(__dirname, '.', 'react', 'build')));
console.log("Serving static assets from directory: " + path.join(__dirname, '.', 'react', 'build'));
console.log("Serving index from: " + path_to_index);



app.get('/', (req, res) => {
  res.send('launch new port 8080');
});

// /packages
app.post("/packages", async (req, res) => {
  console.log('/packages enpoint reached');
  const offset = req.params.offset;

  // 413 if too many packages returned 
  if (length > offset) {
    res.status(404).json({ error: "Too many packages returned." });
  }

  // Otherwise, return a success response, list of packages
  else {

    const packageslist = await post_list();
    console.log(packageslist);
    res.status(200).json({packages: packageslist});
  }
});


// /package
app.post('/package', async (req, res) =>{
  console.log('/package endpoint reached');
  //console.log(req);
  //console.log(req.body);
  //console.log(req.body.Content);

  // TO-DO: 409 -> package exists
  // TO-DO: 424 -> Package is not uploaded due to the disqualified rating

  // error check
  const axios = require('axios');

  const getReadme = async (url) => {
    try {
      const response = await axios.get(`${url}/raw/master/README.md`);
      const readme = response.data.split('\n').slice(0, 200).join('\n');
      return readme;
    } catch (error) {
      console.error(error);
    }
  };
  

  if (req.body.Content) { 
    if(req.body.URL){
    res.status(400).json({error: "Error: both URL and Content are set. Please only set one field."});
    }
    // decode content
    // unzip
    // get package.json
    // get name, version, url
    // ingetst

    // private ingest
    console.log("received an unzipped file");
    await post_zip('name', 'version', 'name_tag', null, req.body.Content, null);

    res.status(201).json({success: "success"});
  }

  // URL given
  else if (req.body.URL){
    console.log("received an url");
    const { exec } = require('child_process');

    const url = req.body.URL;
    let packageName;
    let packageVersion;
    let scoresObj;
    let nameTag;
    let readme;

    exec(`npm view ${url} --json name version`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
        return;
      }
      const packageInfo = JSON.parse(stdout);
      packageName = packageInfo.name;
      packageVersion = packageInfo.version;
      nameTag = packageName.toLowerCase();
      console.log(`Package name: ${packageName}`);
      console.log(`Package version: ${packageVersion}`);

      getReadme(url).then((value) => {
        readme = value; // Assign the resolved value to the readme variable
        console.log(readme); // Log the readme to the console
      });

      const analyzerPath = path.join(__dirname, 'repo_analyzer', 'run'); // Get the path to your Rust program
      // const url = req.body.URL;
      // Spawn your analysis process
      const process = spawn(analyzerPath, [url]);

      process.on('error', (err) => {
        console.error('Failed to start child process.', err);
      });
      
      process.on('exit', (code, signal) => {
        console.log(`Child process exited with code ${code} and signal ${signal}`);
      });
      
      let scores = '';
      process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        scores += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      }); 

      
      process.on('close', () => {
        console.log(`here are the scores: ${scores}`);
        scoresObj = JSON.parse(scores);
        const netscore = parseFloat(scoresObj.NET_SCORE);
        if(netscore > 0.3){
          console.log('score is passing, ingest!');
          // call db function here
          post_url('name', 'version', 'name_tag', scoresObj.URL, 'zip', 'readme',
            scoresObj.NET_SCORE, scoresObj.RAMP_UP_SCORE, scoresObj.CORRECTNESS_SCORE, scoresObj.BUS_FACTOR_SCORE,
            scoresObj.RESPONSIVE_MAINTAINER_SCORE, scoresObj.LICENSE_SCORE, scoresObj.VERSION_PIN_SCORE, scoresObj.ADHERENCE_SCORE);
        }

        // ******************************************************************
        // TO-DO: create package object
        //const package = create_package();
        // TO-DO: save scores and url in package object
        // TO-DO: save to db
        //if(insert_repo_data(package) == -1){
        //  res.status(409).json({ error: 'The package exists already'});
        //}
        // ******************************************************************
        
        res.status(201).json({ success: 'success', name: packageName, version: packageVersion, id: nameTag, URL: url });
        
      });
    });
  }
});


// /package/{ID}

app.get('/package/:ID', async (req, res) =>{
  const packageID = req.params.ID;
  console.log(`Get package/${packageID} endpoint reached`);
  const result =  await getPackage(packageID);

  console.log(result);
  console.log(`nameObj: ${result.main_row}, dataObj: ${result.repo_row}`);
  const name = result.main_row.name;
  const version = result.main_row.version;
  const id = result.main_row.name_tag;
  const contents = result.repo_row.zip;
  const url = result.repo_row.url;
  console.log(`name: ${name}, version: ${version}, id: ${id}, contents: ${contents}, url: ${url}`);


  // get id from db
  const value = {'metadata': {'Name': name, 'Version': version, 'ID': id}, 'Data': {'Content': contents}};
  // format data to return
  res.status(201).json({ success: 'success', output: value });

});
app.delete('/package/:ID', async (req, res) =>{
  const packageID = req.params.ID;
  // get id from db
  console.log(`Delete package/${packageID} endpoint reached`);

  // 404 if package doesn't exist
  // if (!packageExists(packageId)) {
  //   res.status(404).json({ error: "Package Does Not Exist." });
  // }

  // // Otherwise, return a success response with the package information
  // else {
    await delete_nameTag(packageID);
    res.status(200).json({ message : "Package is Deleted." });
  //}
});
app.put('/package/:ID', (req, res) =>{
  const packageID = req.params.ID;
  // get id from db
  console.log(`Put package/${packageID} endpoint reached`);

  // 404 if package doesn't exist
  // if (!packageExists(packageId)) {
  //   res.status(404).json({ error: "Package Does Not Exist." });
  // }

  // Otherwise, return a success response with the package information
  // else {
    retrieveMainTable(packageID);
    retrieveRepoTable(packageID);

    // return contents from the retrieve functions below
    res.status(200).json({  });
  // }
});


// package/{id}/rate endpoint
app.get("/package/:id/rate", async (req, res) => {
  const packageID = req.params.ID;
  console.log(`package/${packageID}/rate endpoint reached`);
  const output = await getScore(packageID);
  // 404 if package doesn't exist
  if (output === -404) {
    res.status(404).json({ error: "Package Does Not Exist." });
  }

  

  // rate package if there is not scored for it
  if (output === -1){
    console.log('package does not have scores set. calculating...');
    // If the package rating system choked, return a 500 error response
    //if (packageRatingChoked(packageId)) {
    //  res.status(500).json({ error: "The package rating system choked on at least one of the metrics." });
    //}
  }

  const totalscore = output.total_score;
  const rampupscore = output.ramp_up_score;
  const correctnessscore = output.correctness_score;
  const busfactor = output.bus_factor;
  const responsivescore = output.responsiveness_score;
  const licensescore = output.license_score;
  const versionscore = output.version_score;
  const adherencescore = output.ladherence_score;

  allscores = {
          'NET_SCORE':totalscore,
          'RAMP_UP_SCORE':rampupscore,
          'CORRECTNESS_SCORE':correctnessscore,
          'BUS_FACTOR_SCORE': busfactor,
          'RESPONSIVE_MAINTAINER_SCORE':responsivescore,
          'LICENSE_SCORE': licensescore,
          'VERSION_PIN_SCORE': versionscore,
          'ADHERENCE_SCORE': adherencescore}

  res.status(200).json({ output: allscores});
});


// /package/byName/{name} ************ JASON ****************************
app.get("/package/byName/:name", (req, res) => {
  const packageName = req.params.name;
  console.log(`GET /package/byName/${packageName} enpoint reached`);
});
// ************ JASON ****************************
app.delete("/package/byName/:name", async (req, res) => {
  const packageName = req.params.name;
  console.log(`DELETE /package/byName/${packageName} enpoint reached`);
  
  await delete_name(packageName);
  // 404 if package doesn't exist
  // if (!packageExists(packageName)) {
  //   res.status(404).json({ error: "No package found under this name." });
  // }

  // Otherwise, return a success response, list of packages
  // else {
    
  res.status(200).json({  });
  // }
});


// /package/byRegEx ************ JASON ****************************
app.post("/package/byRegEx", (req, res) => {
  console.log('/package/byRegEx enpoint reached');
  // 404 if package doesn't exist
  // if (!packageExists(packageRegEx)) {
  //   res.status(404).json({ error: "No package found under this regex." });
  // }

  // Otherwise, return a success response, list of packages
  // else {
    res.status(200).json({  });
  // }
});


// reset endpoint
app.delete("/reset", async (req, res) => {
  // call reset for all 3 tables here
  console.log('/reset enpoint reached');

  await reset();
  await createTables();
  res.status(200).json({ msg: "Registry Reset!" });

});

// authenticate endpoint
app.put("/authenticate", (req, res) => {
  console.log('/authenticate enpoint reached');

  res.status(501).json({ error: "Not Implemented." });
});






app.get("/message", (req, res) => {
  res.json({ message: "Hello from server! Version after download. " });
});

// Start the server
app.listen(port, () => {
  console.log('Espress Server listening on port', port);
});
