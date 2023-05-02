const express = require('express');
const cors = require("cors");
const path = require('path');
const app = express();
const Package = require('./backend/models/package');
const port = process.env.PORT || 8080;
const path_to_index = path.join(__dirname, 'react/build/index.html');

// app.get('/', (req, res) => {
//   res.send('launch new port  8080');
// });

app.use(cors());
app.use(express.json());
// Serve static files from the "build" directory
app.use(express.static(path.join(__dirname, '.', 'react', 'build')));
console.log("Serving static assets from directory: " + path.join(__dirname, '.', 'react', 'build'));
console.log("Serving index from: " + path_to_index);


/*
// Define your other routes and middleware below
// Serve your backend API routes
app.get('/api', (req, res) => {
    // handle your API requests here
  });
*/

// Serve the React app on any other routes
app.get('*', (req, res) => {
  res.sendFile(path_to_index);
  console.log("Serving React App from directory: " + path_to_index);
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
app.get("/package/{id}", (req, res) => {

  // 404 if package doesn't exist
  res.status(404).json({ error: "Package Does Not Exist." });
});  // PackageRetrieve

app.put("/package/{id}", (req, res) => {
  // 404 if package doesn't exist
  res.status(404).json({ error: "Package Does Not Exist." });
});  // PackageUpdate

app.delete("/package/{id}", (req, res) => {
  // 404 if package doesn't exist
  res.status(404).json({ error: "Package Does Not Exist." });
});



// package/{id}/rate endpoint
app.get("/package/{id}", (req, res) => {

  // 404 if package doesn't exist
  res.status(404).json({ error: "Package Does Not Exist." });

  // 500 if prating choked
  res.status(500).json({ error: "The package rating system choked on at least one of the metrics." });
});  // PackageRate



// Start the server
app.listen(port, () => {
  console.log('Espress Server listening on port.', port);
});
