const nodemailer = require('nodemailer');

// Validate that email credentials are provided at startup
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email] WARNING: EMAIL_USER or EMAIL_PASS not set in .env — email sending will fail!');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS   // Must be a Gmail App Password, NOT your real password
    }
});

// Verify connection config on startup (non-fatal)
transporter.verify((error) => {
    if (error) {
        console.error('[Email] SMTP connection failed:', error.message);
        console.error('[Email] Make sure EMAIL_PASS is a valid Gmail App Password (16 chars), not your real password.');
        console.error('[Email] Generate one at: Google Account → Security → 2-Step Verification → App Passwords');
    } else {
        console.log('[Email] SMTP connection verified. Ready to send emails from:', process.env.EMAIL_USER);
    }
});

/**
 * Sends an OTP email.
 * @param {string} to      - Recipient email address
 * @param {string} otp     - The plain-text OTP code
 * @param {string} purpose - 'register' | 'forgot-password'
 */
module.exports = async (to, otp, purpose = 'register') => {
    const subjectMap = {
        'register': 'DevConnect — Verify your email',
        'forgot-password': 'DevConnect — Reset your password'
    };

    const bodyMap = {
        'register':
            `Welcome to DevConnect!\n\n` +
            `Your email verification OTP is: ${otp}\n\n` +
            `This code expires in 10 minutes. Do not share it with anyone.`,
        'forgot-password':
            `You requested a password reset for your DevConnect account.\n\n` +
            `Your OTP code is: ${otp}\n\n` +
            `This code expires in 10 minutes.\n\n` +
            `If you did not request this, please ignore this email.`
    };

    console.log(`[Email] Sending ${purpose} OTP to: ${to}`);

    try {
        const info = await transporter.sendMail({
            // FIX: 'from' must match the authenticated EMAIL_USER Gmail account
            from: `"DevConnect" <${process.env.EMAIL_USER}>`,
            to,
            subject: subjectMap[purpose] || 'DevConnect — OTP Code',
            text: bodyMap[purpose] || `Your OTP is ${otp}. It expires in 10 minutes.`
        });
        console.log(`[Email] Sent successfully! Message ID: ${info.messageId}`);
    } catch (err) {
        console.error(`[Email] Failed to send to ${to}:`, err.message);
        throw err; // re-throw so the controller returns a 500 to the client
    }
};