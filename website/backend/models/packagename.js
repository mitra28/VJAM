const mongoose = require('mongoose');

const PackageNameSchema = new mongoose.Schema({
  "Name": { type: String},
});

// Define your Package model
const PackageName = mongoose.model('PackageName', PackageNameSchema);
module.exports = PackageName;