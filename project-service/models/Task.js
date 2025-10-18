    // File: devconnect/project-service/models/Task.js
const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
}, { timestamps: true });
module.exports = mongoose.model('Task', TaskSchema);