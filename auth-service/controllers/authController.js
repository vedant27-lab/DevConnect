// File: devconnect/auth-service/controllers/authController.js
const User = require('../models/User');
const EmailOtp = require('../models/EmailOtp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOtp, hashOtp } = require('../utils/otp');
const sendEmail = require('../utils/sendEmail');

// ─────────────────────────────────────────────
//  REGISTER  (requires prior email OTP verification)
//  Body: { username, email, password, otp }
//  Flow: frontend first calls /request-register-otp, then submits
//        all fields + the OTP here to complete registration.
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { username, email, password, otp } = req.body;

        if (!username || !email || !password || !otp) {
            return res.status(400).json({ msg: 'All fields including OTP are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters' });
        }

        // Check email not already taken
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email is already registered' });

        // Check username not already taken
        const usernameExists = await User.findOne({ username });
        if (usernameExists) return res.status(400).json({ msg: 'Username is already taken' });

        // Verify the OTP
        const otpHash = hashOtp(otp);
        const otpRecord = await EmailOtp.findOne({ email, otpHash, purpose: 'register' });

        if (!otpRecord) return res.status(400).json({ msg: 'Invalid OTP. Please request a new one.' });
        if (otpRecord.expiresAt < new Date()) return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });

        // OTP valid — create the account
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            username,
            email,
            password: hashedPassword,
            isEmailVarified: true   // email is verified because they passed OTP
        });

        // Consume the OTP so it cannot be reused
        await EmailOtp.deleteMany({ email, purpose: 'register' });

        const payload = { user: { id: user.id, username: user.username } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        console.log(`[Auth] New user registered: ${email}`);
        res.status(201).json({ token, msg: 'Account created successfully!' });
    } catch (err) {
        console.error('[Register] Error:', err.message);
        res.status(500).send('Server error');
    }
};

// ─────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id, username: user.username } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// ─────────────────────────────────────────────
//  CHANGE PASSWORD (requires auth middleware)
//  FIX: was using req.body as userEmail (got whole body object)
//  FIX: was calling User.findUserByEmail() which doesn't exist
// ─────────────────────────────────────────────
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        // req.user is set by the auth middleware after JWT verification
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Old password is incorrect' });

        const samePassword = await bcrypt.compare(newPassword, user.password);
        if (samePassword) return res.status(400).json({ msg: 'New password must be different from old password' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Password changed successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ─────────────────────────────────────────────
//  VERIFY TOKEN  (internal — used by other microservices)
// ─────────────────────────────────────────────
exports.verifyToken = (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(401).json({ msg: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user: decoded.user });
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// ─────────────────────────────────────────────
//  FIND USER BY EMAIL  (internal — used by other microservices)
// ─────────────────────────────────────────────
exports.findUserByEmail = async (req, res) => {
    try {
        const userEmail = req.params.email;
        console.log(`[Auth Service] Received request to find user by email: ${userEmail}`);

        const user = await User.findOne({ email: userEmail }).select('-password');
        if (!user) {
            console.log(`[Auth Service] User with email ${userEmail} NOT FOUND.`);
            return res.status(404).json({ msg: 'User not found' });
        }

        console.log(`[Auth Service] Found user with ID: ${user.id}`);
        res.json({ id: user.id, username: user.username });
    } catch (err) {
        console.error('[Auth Service] Error finding user:', err.message);
        res.status(500).send('Server Error');
    }
};

// ─────────────────────────────────────────────
//  REQUEST REGISTER OTP
//  Body: { username, email }
//  Validates both fields are free, then sends OTP.
// ─────────────────────────────────────────────
exports.requestRegisterOtp = async (req, res) => {
    try {
        const { email, username } = req.body;
        if (!email || !username) return res.status(400).json({ msg: 'Username and email are required' });

        // Early conflict checks so the user knows immediately
        const emailTaken = await User.findOne({ email });
        if (emailTaken) return res.status(400).json({ msg: 'Email is already registered' });

        const usernameTaken = await User.findOne({ username });
        if (usernameTaken) return res.status(400).json({ msg: 'Username is already taken' });

        // Invalidate any previous OTPs for this email + purpose
        await EmailOtp.deleteMany({ email, purpose: 'register' });

        const otp = generateOtp();
        const otpHash = hashOtp(otp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await EmailOtp.create({ email, otpHash, purpose: 'register', expiresAt });
        await sendEmail(email, otp, 'register');

        res.json({ msg: 'OTP sent to your email. It expires in 10 minutes.' });
    } catch (err) {
        console.error('[OTP Register] Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// ─────────────────────────────────────────────
//  VERIFY REGISTER OTP
// ─────────────────────────────────────────────
exports.verifyRegisterOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ msg: 'Email and OTP are required' });

        const otpHash = hashOtp(otp);
        const record = await EmailOtp.findOne({ email, otpHash, purpose: 'register' });

        if (!record) return res.status(400).json({ msg: 'Invalid OTP' });
        if (record.expiresAt < new Date()) return res.status(400).json({ msg: 'OTP has expired' });

        record.verified = true;
        await record.save();

        res.json({ msg: 'Email verified successfully' });
    } catch (err) {
        console.error('[OTP Verify Register] Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// ─────────────────────────────────────────────
//  FORGOT PASSWORD — Step 1: Request OTP
// ─────────────────────────────────────────────
exports.requestForgotPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ msg: 'Email is required' });

        // Check if user exists — but don't reveal if they don't (security best practice)
        const user = await User.findOne({ email });
        if (!user) {
            // Return 200 even if user doesn't exist (prevents email enumeration attacks)
            return res.status(200).json({ msg: 'If that email is registered, an OTP has been sent.' });
        }

        // Invalidate previous forgot-password OTPs for this email
        await EmailOtp.deleteMany({ email, purpose: 'forgot-password' });

        const otp = generateOtp();
        const otpHash = hashOtp(otp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await EmailOtp.create({ email, otpHash, purpose: 'forgot-password', expiresAt });
        await sendEmail(email, otp, 'forgot-password');

        res.json({ msg: 'If that email is registered, an OTP has been sent.' });
    } catch (err) {
        console.error('[Forgot Password OTP] Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// ─────────────────────────────────────────────
//  FORGOT PASSWORD — Step 2: Verify OTP
// ─────────────────────────────────────────────
exports.verifyForgotPasswordOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ msg: 'Email and OTP are required' });

        const otpHash = hashOtp(otp);
        const record = await EmailOtp.findOne({ email, otpHash, purpose: 'forgot-password' });

        if (!record) return res.status(400).json({ msg: 'Invalid OTP' });
        if (record.expiresAt < new Date()) return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });

        // Mark as verified — allows the reset step
        record.verified = true;
        await record.save();

        res.json({ msg: 'OTP verified. You can now reset your password.' });
    } catch (err) {
        console.error('[Verify Forgot OTP] Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// ─────────────────────────────────────────────
//  FORGOT PASSWORD — Step 3: Reset Password
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ msg: 'Email, OTP, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters' });
        }

        const otpHash = hashOtp(otp);
        const record = await EmailOtp.findOne({ email, otpHash, purpose: 'forgot-password', verified: true });

        if (!record) return res.status(400).json({ msg: 'Invalid or unverified OTP. Please start over.' });
        if (record.expiresAt < new Date()) return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Consume the OTP so it cannot be reused
        await EmailOtp.deleteMany({ email, purpose: 'forgot-password' });

        res.json({ msg: 'Password reset successfully! You can now log in.' });
    } catch (err) {
        console.error('[Reset Password] Error:', err.message);
        res.status(500).send('Server Error');
    }
};