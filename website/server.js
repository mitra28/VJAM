const express = require('express');
const cors = require("cors");
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const packageRoutes = require('./backend/routes/packageroutes');
const Package = require('./backend/models/package');
const upload = multer({ dest: 'temp/' });

// initialize db
// engine = init_engine();
// delete_table(engine,"repo_info");
// delete_table(engine,"zipped_table");
// create_repo_table(engine);
// create_zip_table(engine);

const port = 8080; // process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/packages', packageRoutes);

// Serve static files from the "build" directory
app.use(express.static(path.join(__dirname, '.', 'react', 'build')));
console.log("Serving static assets from directory: " + path.join(__dirname, '.', 'react', 'build'));

app.get('/', (req, res) => {
  res.send('launch new port  8080');
});


app.post('/packages', upload.single('file'), (req, res) =>{
  const { filename, mimetype, path: filepath } = req.file;
  // Get the path to your Rust program
  const analyzerPath = path.join(__dirname, 'repo_analyzer', 'run');
  // TO-DO: unzip package
  // TO-DO: 
  // get the url inside filepath (package.json)
  const url = filepath
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

  //scores = repo_analyzer()
  
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
