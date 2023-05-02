const mongoose = require('mongoose');
const PackageMetadata = require('./packagemetadata').schema;
const PackageData = require('./packagedata').schema;

//NOTE: Had to add .schema to imports to make this work
const packageSchema = new mongoose.Schema({
  "metadata": { type: PackageMetadata},
  "data": { type: PackageData},
});

// Define your Package model
const Package = mongoose.model('Package', packageSchema);
module.exports = Package;