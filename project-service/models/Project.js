// File: devconnect/project-service/models/Project.js
const mongoose = require('mongoose');
const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: String, required: true }, // User ID from Auth Service
    members: [{ type: String }], // Array of User IDs
}, { timestamps: true });
module.exports = mongoose.model('Project', ProjectSchema);