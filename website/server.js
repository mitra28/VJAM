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
// create_repo_table(engine);
// create_zip_table(engine);

const port = 7080; // process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/packages', packageRoutes);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the "build" directory
app.use(express.static(path.join(__dirname, '.', 'react', 'build')));
console.log("Serving static assets from directory: " + path.join(__dirname, '.', 'react', 'build'));

app.get('/', (req, res) => {
  res.send('launch new port  8080');
});



app.post('/zippackages', upload.single('file'), (req, res) =>{
  const { filename, mimetype, path: filepath } = req.file;
  console.log("/zippackages");
  console.log(req.file);
  console.log(filename);
  
  
});

app.post('/packages', (req, res) =>{
  console.log(req.file);
  console.log(req.body);
  console.log(req.body.constructor.name);

  if (req.headers['content-type'].startsWith('multipart/form-data')) { 
    if(req.file){
      // Request body is a file
      const { filename, mimetype, path: filepath } = req.file;
      console.log(filename);
      console.log(filepath);
      }
  }
  // URL given
  else if (req.body.packageUrl){
      const analyzerPath = path.join(__dirname, 'repo_analyzer', 'run'); // Get the path to your Rust program
      const url = req.body.packageUrl;
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

});




app.get("/message", (req, res) => {
    res.json({ message: "Hello from server! Version after download. " });
  });

// Start the server
app.listen(port, () => {
  console.log('Espress Server listening on port', port);
});
