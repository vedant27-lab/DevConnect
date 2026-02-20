// File: devconnect/auth-service/routes/auth.js
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const {
    register,
    login,
    verifyToken,
    findUserByEmail,
    changePassword,
    requestRegisterOtp,
    verifyRegisterOtp,
    requestForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPassword
} = require('../controllers/authController');

// Auth
router.post('/register', register);
router.post('/login', login);
router.post('/changePassword', auth, changePassword);

// Internal token verification (used by other microservices)
router.post('/verify', verifyToken);
router.get('/user/email/:email', findUserByEmail);

// Register OTP
router.post('/request-register-otp', requestRegisterOtp);
router.post('/verify-register-otp', verifyRegisterOtp);

// Forgot Password (3-step flow)
router.post('/forgot-password/request-otp', requestForgotPasswordOtp);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOtp);
router.post('/forgot-password/reset', resetPassword);

module.exports = router;