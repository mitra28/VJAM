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
    res.json({ message: "Hello from server!" });
});

// Start the server
app.listen(port, () => {
  console.log('Espress Server listening on port', port);
});
