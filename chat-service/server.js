// File: devconnect/chat-service/server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Message = require('./models/Message');
const authMiddlewareSocket = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"]
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected to Chat Service'))
    .catch(err => console.error(err));

app.get('/', (req, res) => res.send('Chat Service is running successfully.'));

// REST endpoint to get previous messages for a project
app.get('/api/messages/:projectId', async (req, res) => {
    try {
        const messages = await Message.find({ project: req.params.projectId }).sort({ createdAt: 1 }).limit(50);
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Use custom middleware for Socket.io authentication
io.use(authMiddlewareSocket);

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    // Handler for joining a project-specific chat room
    socket.on('joinRoom', ({ projectId }) => {
        socket.join(projectId);
        console.log(`User ${socket.user.username} joined room ${projectId}`);
    });

    // Handler for sending a message
    socket.on('sendMessage', async ({ projectId, text }) => {
        try {
            const message = new Message({
                project: projectId,
                user: {
                    id: socket.user.id,
                    username: socket.user.username
                },
                text: text
            });
            await message.save();
            // Broadcast the message to everyone in the room
            io.to(projectId).emit('message', message);
        } catch (error) {
            console.error('Error saving or broadcasting message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username} (${socket.id})`);
    });
});

const PORT = process.env.PORT || 5003;
server.listen(PORT, () => console.log(`Chat Service running on port ${PORT}`)); 