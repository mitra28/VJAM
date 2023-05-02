const mongoose = require('mongoose');

const PackageRegExSchema = new mongoose.Schema({
  "RegEx": { type: String},
});

// Define your Package model
const PackageRegEx = mongoose.model('PackageRegEx', PackageRegExSchema);
module.exports = PackageRegEx;