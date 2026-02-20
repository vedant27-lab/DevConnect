// dotenv MUST be loaded first — before any other require that reads process.env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Auth Service is running successfully.'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected to Auth Service');
        app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;