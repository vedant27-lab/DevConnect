// File: devconnect/auth-service/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, verifyToken, findUserByEmail } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
// This is an internal route for other services to verify a token
router.post('/verify', verifyToken);
router.post('/user/email/:email', findUserByEmail);

module.exports = router;