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


const PackageData = require ('./backend/models/packagedata');

// initialize db
// engine = init_engine();
// delete_table(engine,"repo_info");
// delete_table(engine,"zipped_table");
import { deleteTable } from "../packageDirectory/database.py"
// create_repo_table(engine);
// create_zip_table(engine);

path_to_index = path.join(__dirname, '.', 'react', 'build', 'index.html');

const port = 8080; // process.env.PORT || 8080;
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
  res.send('launch new port  8080');
});

app.post('/package', (req, res) =>{
  //console.log(req);
  //console.log(req.body);
  //console.log(req.body.Content);

  // error check

  if (req.body.Content) { 
    // private ingest
    console.log("received an unzipped file");
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
      
      process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
      
      process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      }); 

    }
    else{
      console.log('Content and URL cannot both be set');
    }

  // insert_repo_data(engine, repo_name, url, total_score, ramp_up_score, correctness_score, bus_factor, responsiveness_score, license_score, version_score, adherence_score);
  // insert_zipped_data(engine, file_name, url, zipped_file); 
    //res.status(400).json({error: "error message"});
});



app.get("/message", (req, res) => {
  res.json({ message: "Hello from server! Version after download. " });
});


// authenticate endpoint
app.put("/authenticate", (req, res) => {
  res.status(501).json({ error: "Not Implemented." });
});



// reset endpoint
app.put("/reset", (req, res) => {
  // call reset for all 3 tables here
});




// package/{id} endpoint
app.get("/package/:id", (req, res) => {
  const packageId = req.params.id;



  if (!packageExists(packageId)) {// 404 if package doesn't exist
    res.status(404).json({ error: "Package Does Not Exist." });
  }

  // Otherwise, return a success response with the package information
  else {
    res.status(200).json({  });
  }
});  // PackageRetrieve



app.put("/package/:id", (req, res) => {
  const packageId = req.params.id;


  // 404 if package doesn't exist
  if (!packageExists(packageId)) {
    res.status(404).json({ error: "Package Does Not Exist." });
  }

  // Otherwise, return a success response 
  else {
    res.status(200).json({ message: "Version is Updated." });
  }
});  // PackageUpdate



app.delete("/package/:id", (req, res) => {
  const packageId = req.params.id;


  // 404 if package doesn't exist
  if (!packageExists(packageId)) {
    res.status(404).json({ error: "Package Does Not Exist." });
  }

  // Otherwise, return a success response
  else {
    res.status(200).json({ message: "Package Deleted." });
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
});  // PackageRate



// Start the server
app.listen(port, () => {
  console.log('Espress Server listening on port', port);
});
