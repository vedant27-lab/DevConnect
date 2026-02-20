const mongoose = require('mongoose');

const EmailOtpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otpHash: { type: String, required: true },
    purpose: {
        type: String,
        enum: ['register', 'forgot-password'],
        required: true
    },
    expiresAt: { type: Date, required: true }, // FIX: was 'Data' (typo) — caused server crash
    verified: { type: Boolean, default: false }
});

// Auto-delete expired OTP documents from the collection
EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailOtp', EmailOtpSchema);