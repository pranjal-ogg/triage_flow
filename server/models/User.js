const mongoose = require('mongoose');

// User Schema for Authentication
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // bcrypt hashed
  plainPassword: String, // plain text for admin to view
  role: { type: String, enum: ['admin', 'doctor', 'nurse'] },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
