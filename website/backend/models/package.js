const mongoose = require('mongoose');
const PackageMetadata = require('./packagemetadata');
const PackageData = require('./packagedata');

const packageSchema = new mongoose.Schema({
  "metadata": { type: PackageMetadata},
  "data": { type: PackageData},
});

// Define your Package model
const Package = mongoose.model('Package', packageSchema);
module.exports = Package;