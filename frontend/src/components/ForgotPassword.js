import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * ForgotPassword — 3-step OTP flow:
 *  Step 1: Enter email → request OTP
 *  Step 2: Enter OTP  → verify OTP
 *  Step 3: Enter new password → reset
 */
const ForgotPassword = ({ onBack }) => {
    const { requestForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } = useAuth();

    const [step, setStep] = useState(1); // 1 | 2 | 3
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const clearMessages = () => { setMsg(''); setError(''); };

    // ── Step 1: Request OTP ──────────────────────────────────────────
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);
        try {
            const res = await requestForgotPasswordOtp(email);
            setMsg(res.data.msg);
            setStep(2);
            startResendTimer(60);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP. Try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Verify OTP ───────────────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);
        try {
            const res = await verifyForgotPasswordOtp(email, otp);
            setMsg(res.data.msg);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: Reset Password ───────────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        clearMessages();

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (newPassword.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const res = await resetPassword(email, otp, newPassword);
            setMsg(res.data.msg);
            // Show success for a moment, then go back to login
            setTimeout(() => onBack(), 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to reset password. Please start over.');
        } finally {
            setLoading(false);
        }
    };

    // ── Resend OTP timer ─────────────────────────────────────────────
    const startResendTimer = (seconds) => {
        setResendTimer(seconds);
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResend = async () => {
        clearMessages();
        setLoading(true);
        try {
            await requestForgotPasswordOtp(email);
            setMsg('OTP resent! Check your email.');
            startResendTimer(60);
        } catch (err) {
            setError('Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-wrapper">
            {/* Step indicator */}
            <div className="step-indicator">
                <span className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</span>
                <span className="step-line" />
                <span className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</span>
                <span className="step-line" />
                <span className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</span>
            </div>

            <p className="step-label">
                {step === 1 && 'Enter your email'}
                {step === 2 && 'Enter the OTP sent to your email'}
                {step === 3 && 'Set your new password'}
            </p>

            {msg && <p className="success-message">{msg}</p>}
            {error && <p className="error-message">{error}</p>}

            {/* ── STEP 1 ── */}
            {step === 1 && (
                <form onSubmit={handleRequestOtp}>
                    <input
                        type="email"
                        placeholder="Your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
                <form onSubmit={handleVerifyOtp}>
                    <div className="otp-input-group">
                        <input
                            type="text"
                            placeholder="6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            required
                            autoFocus
                            className="otp-input"
                        />
                    </div>
                    <p className="otp-hint">
                        Check <strong>{email}</strong> for the OTP code.
                    </p>
                    <button type="submit" disabled={loading || otp.length !== 6}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                        type="button"
                        className="toggle-auth-btn"
                        onClick={handleResend}
                        disabled={resendTimer > 0 || loading}
                    >
                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                </form>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
                <form onSubmit={handleResetPassword}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}

            {/* Back to login */}
            {step !== 3 && (
                <button type="button" className="toggle-auth-btn" onClick={onBack}>
                    ← Back to Login
                </button>
            )}
        </div>
    );
};

export default ForgotPassword;
