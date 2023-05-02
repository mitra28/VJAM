const mongoose = require('mongoose');

const PackageIDSchema = new mongoose.Schema({
  "ID": { type: String},
});

// Define your Package model
const PackageID = mongoose.model('PackageID', PackageIDSchema);
module.exports = PackageID;
