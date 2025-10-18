// File: devconnect/project-service/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => res.send('Project Service is running successfully.'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected to Project Service');
        app.listen(PORT, '0.0.0.0', () => console.log(`Project Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));