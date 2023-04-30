const mongoose = require('mongoose');
const PackageName = require('./packagename');

const PackageQuerySchema = new mongoose.Schema({
    "Name": { type: PackageName},
});

// Define your Package model
const PackageQuery = mongoose.model('PackageQuery', PackageQuerySchema);
module.exports = PackageQuery;