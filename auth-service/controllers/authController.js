// File: devconnect/auth-service/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { generateOtp, hashOtp } = require('../utils/otp');
const sendEmail = require('../utils/sendEmail')
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ username, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id, username: user.username } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

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

exports.changePassword = async (req, res) => {
    try {
        const userEmail = req.body;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const user = await User.findUserByEmail(userEmail);
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) return res.status(400).json({ msg: 'Old password is incorrect' });

        const samePassword = await bcrypt.compare(newPassword, user.password);
        if (samePassword) return res.status(400).json({ msg: 'New password must be different from old password' });

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({msg: "Password changed Successfully !"});
    }catch(err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Internal controller to verify token for other microservices
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

// This is the function with added debugging logs.
exports.findUserByEmail = async (req, res) => {
    try {
        const userEmail = req.params.email;

        // --- LOG 4: See if the request arrives and with what email ---
        console.log(`[Auth Service] Received request to find user by email: ${userEmail}`);

        const user = await User.findOne({ email: userEmail }).select('-password');

        // --- LOG 5: See the result of the database query ---
        if (!user) {
            console.log(`[Auth Service] Query result: User with email ${userEmail} NOT FOUND in database.`);
            return res.status(404).json({ msg: 'User not found' });
        }
        
        console.log(`[Auth Service] Query result: Found user with ID: ${user.id}`);
        res.json({ id: user.id, username: user.username });

    } catch (err) {
        console.error('[Auth Service] Server error while finding user:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.requestRegisterOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (existingUser) {
            return res.status(400).json({ msg: 'Email already registered'});
        }

        const otp = generateOtp();

        await EmailOtp.de
    }catch (err) {
        console.error('[Auth Service error while finding user:', err.message);
        res.status(500).send('Server Error')
    }
}