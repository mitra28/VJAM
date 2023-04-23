const express = require('express');
const cors = require("cors");
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const packageRoutes = require('./backend/routes/packageroutes');
const Package = require('./backend/models/package');
const upload = multer({ dest: 'temp/' });


const port = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', packageRoutes);

// Serve static files from the "build" directory
app.use(express.static(path.join(__dirname, '.', 'react', 'build')));
console.log("Serving static assets from directory: " + path.join(__dirname, '.', 'react', 'build'));

app.get('/', (req, res) => {
  res.send('launch new port  8080');
});

app.post('/api/packages', upload.single('file'), (req, res) =>{
  const { filename, mimetype, path } = req.file;
  // Get the path to your Rust program
  const analyzerPath = path.join(__dirname, 'repo_analyzer', 'src', 'main.rs');

  // run analyzer
  // Spawn your analysis process
  const process = spawn(analyzerPath, [path]);
  
  
  score = 0;
  
  if (score < 0.5){
    // dont save
  }
  else{
    // save
  }
});




app.get("/message", (req, res) => {
    res.json({ message: "Hello from server! Version after download. " });
  });

// Start the server
app.listen(port, () => {
  console.log('Espress Server listening on port', port);
});
