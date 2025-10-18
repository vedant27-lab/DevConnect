// File: devconnect/auth-service/models/User.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);