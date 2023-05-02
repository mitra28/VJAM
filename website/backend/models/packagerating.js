const mongoose = require('mongoose');

const PackageRatingSchema = new mongoose.Schema({
  "NetScore": { type: Number},
  "RampUp": { type: Number },
  "Correctness": { type: Number},
  "BusFactor": { type: Number},
  "ResponsiveMaintainer": { type: Number },
  "LicenseScore": { type: Number},
  "GoodPinningPractice": { type: Number },
  "PullRequest": { type: Number},
});

// Define your Package model
const PackageRating = mongoose.model('PackageRating', PackageRatingSchema);
module.exports = PackageRating;