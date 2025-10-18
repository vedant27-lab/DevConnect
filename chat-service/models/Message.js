// File: devconnect/chat-service/models/Message.js
const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    project: { type: String, required: true, index: true },
    user: {
        id: { type: String, required: true },
        username: { type: String, required: true }
    },
    text: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Message', MessageSchema);