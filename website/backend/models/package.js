const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  owner_name: { type: String, required: true },
  repository_name: { type: String, required: true },
  url: { type: String, required: true },
  scores: {type: Map, of: String},
});

// Define your Package model
const Package = mongoose.model('Package', packageSchema);
module.exports = Package;