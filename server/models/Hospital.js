const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hospital', HospitalSchema);
