const mongoose = require('mongoose');
const PackageName = require('./packagename').schema;

//NOTE: Had to add .schema to imports to make this work
const PackageQuerySchema = new mongoose.Schema({
    "Name": { type: String},
});

// Define your Package model
const PackageQuery = mongoose.model('PackageQuery', PackageQuerySchema);
module.exports = PackageQuery;