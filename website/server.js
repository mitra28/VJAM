const express = require('express');
const cors = require("cors");
const path = require('path');
const app = express();
const packageRoutes = require('./backend/routes/packageroutes');
const Package = require('./backend/models/package');
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('launch new port  8080');
});

app.use(cors());
app.use(express.json());
// Serve static files from the "build" directory
app.use(express.static(path.join(__dirname, '.', 'react', 'build')));
console.log("Serving static assets from directory: " + path.join(__dirname, '.', 'react', 'build'));

app.use('/api', packageRoutes);

/*
// Define your other routes and middleware below
// Serve your backend API routes
app.get('/api', (req, res) => {
    // handle your API requests here
  });
  
// Serve the React app on any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'website/build/index.html'));
    console.log("Serving React App from directory: " + path.join(__dirname, 'website/build/index.html'));
  });*/

app.get("/message", (req, res) => {
    res.json({ message: "Hello from server! Version after download. " });
  });


// Start the server
app.listen(port, () => {
  console.log('Espress Server listening on port ${port}');
});
