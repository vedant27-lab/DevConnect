// File: devconnect/auth-service/routes/auth.js
const express = require('express');
const auth = require('../middleware/auth')
const router = express.Router();
const { register, login, verifyToken, findUserByEmail, changePassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/changePassword', auth, changePassword);
// This is an internal route for other services to verify a token
router.post('/verify', verifyToken);
router.get('/user/email/:email', findUserByEmail);

module.exports = router;