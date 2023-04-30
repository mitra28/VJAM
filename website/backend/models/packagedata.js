const mongoose = require('mongoose');

const PackageDataSchema = new mongoose.Schema({
  "Content": { type: String},
  "URL": { type: String },
  "JSProgram": { type: String},
});

// Define your Package model
const PackageData = mongoose.model('PackageData', PackageDataSchema);
module.exports = PackageData;