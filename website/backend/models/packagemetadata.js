const mongoose = require('mongoose');
const PackageName = require('./packagename');
const PackageID = require('./packageid');

const PackageMetadataSchema = new mongoose.Schema({
  "Name": { type: PackageName},
  "Version": { type: String },
  "ID": { type: PackageID}, 
});

// Define your Package model
const PackageMetadata = mongoose.model('PackageMetadata', PackageMetadataSchema);
module.exports = PackageMetadata;