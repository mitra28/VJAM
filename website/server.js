
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
// const databaseFunctions = require('../packageDirectory/database.js');
//const { deleteTable } = require('../packageDirectory/database.js');

async function main() {
  const databaseFunctions = await import('../packageDirectory/database.js');
  return databaseFunctions;
}
async function reset(string) {
  const db = await main();
  const { deleteTable } = db;
  deleteTable("main_table");
  deleteTable("score_table");
  deleteTable("repo_table");
}
async function createMainTable() {
  const db = await main();
  const { createMainTable,createRepoTable,createScoreTable} = db;
  createMainTable();
  createRepoTable();
  createScoreTable();
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

const port = 9000; // process.env.PORT || 8080;
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
app.post("/packages", (req, res) => {
  const offset = req.params.offset;

  // 413 if too many packages returned 
  if (length > offset) {
    res.status(404).json({ error: "Too many packages returned." });
  }

  // Otherwise, return a success response, list of packages
  else {
    res.status(200).json({  });
  }
});


// /package
app.post('/package', (req, res) =>{
  //console.log(req);
  //console.log(req.body);
  //console.log(req.body.Content);

  // TO-DO: 409 -> package exists
  // TO-DO: 424 -> Package is not uploaded due to the disqualified rating

  // error check
  

  if (req.body.Content) { 
    if(req.body.URL){
    res.status(400).json({error: "Error: both URL and Content are set. Please only set one field."});
    }
    // private ingest
    console.log("received an unzipped file");
    res.status(201).json({success: "success"});
  }
  // URL given
  else if (req.body.URL){
      console.log("received an url");
      const analyzerPath = path.join(__dirname, 'repo_analyzer', 'run'); // Get the path to your Rust program
      const url = req.body.URL;
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
        const scoresObj = JSON.parse(scores);

        // ******************************************************************
        // TO-DO: create package object
        const package = create_package();
        // TO-DO: save scores and url in package object
        // TO-DO: save to db
        if(insert_repo_data(package) == -1){
          res.status(409).json({ error: 'The package exists already'});
        }
        // ******************************************************************
        
        res.status(201).json({ success: 'success', output: scoresObj });
        
      });

      

      
    }

  // insert_repo_data(engine, repo_name, url, total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score);
  // insert_zipped_data(engine, file_name, url, zipped_file); 
    //res.status(400).json({error: "error message"});
});


// /package/{ID}
app.get('/package/:ID', (req, res) =>{
  const packageID = req.params.ID;
  console.log(`Get package/${packageID} endpoint reached`);

  // get id from db
  const scores = '{"URL":"https://github.com/marcelklehr/nodist", "NET_SCORE":0.48, "RAMP_UP_SCORE":0.78, "CORRECTNESS_SCORE":0.02, "BUS_FACTOR_SCORE":0.21, "RESPONSIVE_MAINTAINER_SCORE":0.18, "LICENSE_SCORE":1.00, "VERSION_PIN_SCORE":0.90, "ADHERENCE_SCORE":0.60}';
  // format data to return
  const scoresObj = JSON.parse(scores); // if scores is a string json
  res.status(201).json({ success: 'success', output: scoresObj });

});
app.delete('/package/:ID', (req, res) =>{
  const packageID = req.params.ID;
  // get id from db
  console.log(`Delete package/${packageID} endpoint reached`);

  // 404 if package doesn't exist
  if (!packageExists(packageId)) {
    res.status(404).json({ error: "Package Does Not Exist." });
  }

  // Otherwise, return a success response with the package information
  else {
    deleteID(packageID);
    res.status(200).json({ message : "Package is Deleted." });
  }
});
app.put('/package/:ID', (req, res) =>{
  const packageID = req.params.ID;
  // get id from db
  console.log(`Put package/${packageID} endpoint reached`);

  // 404 if package doesn't exist
  if (!packageExists(packageId)) {
    res.status(404).json({ error: "Package Does Not Exist." });
  }

  // Otherwise, return a success response with the package information
  else {
    retrieveMainTable(packageID);
    retrieveRepoTable(packageID);

    // return contents from the retrieve functions below
    res.status(200).json({  });
  }
});


// package/{id}/rate endpoint
app.get("/package/:id/rate", (req, res) => {
  const packageId = req.params.id;

  // 404 if package doesn't exist
  if (!packageExists(packageId)) {
    res.status(404).json({ error: "Package Does Not Exist." });
  }

  // If the package rating system choked, return a 500 error response
  else if (packageRatingChoked(packageId)) {
    res.status(500).json({ error: "The package rating system choked on at least one of the metrics." });
  }

  // Otherwise, return a success response
  else {
    res.status(200).json({ packageId });
  }
});


// /package/byName/{name}
app.get("/package/byName/:name", (req, res) => {

});
app.delete("/package/byName/:name", (req, res) => {
  const packageName = req.params.name;

  // 404 if package doesn't exist
  if (!packageExists(packageName)) {
    res.status(404).json({ error: "No package found under this name." });
  }

  // Otherwise, return a success response, list of packages
  else {
    res.status(200).json({  });
  }
});


// /package/byRegEx
app.post("/package/byRegEx", (req, res) => {
  // 404 if package doesn't exist
  if (!packageExists(packageRegEx)) {
    res.status(404).json({ error: "No package found under this regex." });
  }

  // Otherwise, return a success response, list of packages
  else {
    res.status(200).json({  });
  }
});


// reset endpoint
app.delete("/reset", (req, res) => {
  // call reset for all 3 tables here
  deleteTable(repo_table);
  deleteTable(score_table);
  deleteTable(main_table);
});

// authenticate endpoint
app.put("/authenticate", (req, res) => {
  res.status(501).json({ error: "Not Implemented." });
});






app.get("/message", (req, res) => {
  res.json({ message: "Hello from server! Version after download. " });
});

// Start the server
app.listen(port, () => {
  console.log('Espress Server listening on port', port);
});
