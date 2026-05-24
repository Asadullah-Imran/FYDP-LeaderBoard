const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Added for email/pass auth
  image: { type: String }, // Profile picture URL
  role: { type: String, enum: ['member', 'admin'], default: 'member' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
