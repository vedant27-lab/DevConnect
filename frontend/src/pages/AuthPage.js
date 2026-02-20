// File: devconnect/frontend/src/pages/AuthPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import ForgotPassword from '../components/ForgotPassword';
import './AuthPage.css';

// ─── REGISTRATION SUB-COMPONENT (2-step OTP flow) ──────────────────────────
const RegisterForm = ({ onSwitchToLogin }) => {
  const { requestRegisterOtp, register } = useAuth();
  const navigate = useNavigate();

  // step: 1 = fill details, 2 = enter OTP
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const startResendTimer = (seconds) => {
    setResendTimer(seconds);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: validate & send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await requestRegisterOtp(formData.username, formData.email);
      setMsg(res.data.msg);
      setStep(2);
      startResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setError(''); setMsg('');
    setLoading(true);
    try {
      await requestRegisterOtp(formData.username, formData.email);
      setMsg('OTP resent! Check your email.');
      startResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP + create account
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    setLoading(true);
    try {
      await register(formData.username, formData.email, formData.password, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Step indicator */}
      <div className="step-indicator">
        <span className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</span>
        <span className="step-line" />
        <span className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</span>
      </div>
      <p className="step-label">
        {step === 1 ? 'Fill in your details' : `Enter the OTP sent to ${formData.email}`}
      </p>

      {msg && <p className="success-message">{msg}</p>}
      {error && <p className="error-message">{error}</p>}

      {/* ── STEP 1: Details ── */}
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            autoFocus
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send Verification Code'}
          </button>
        </form>
      )}

      {/* ── STEP 2: Enter OTP ── */}
      {step === 2 && (
        <form onSubmit={handleRegister}>
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
          <button type="submit" disabled={loading || otp.length !== 6}>
            {loading ? 'Creating Account...' : 'Verify & Create Account'}
          </button>
          <button
            type="button"
            className="toggle-auth-btn"
            onClick={handleResend}
            disabled={resendTimer > 0 || loading}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </button>
          <button
            type="button"
            className="toggle-auth-btn"
            onClick={() => { setStep(1); setOtp(''); setMsg(''); setError(''); }}
          >
            ← Edit Details
          </button>
        </form>
      )}
    </>
  );
};

// ─── MAIN AUTH PAGE ─────────────────────────────────────────────────────────
// authView: 'login' | 'register' | 'changePassword' | 'forgotPassword'
const AuthPage = () => {
  const [authView, setAuthView] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const switchView = (view) => {
    setError('');
    setAuthView(view);
    setFormData({ email: '', password: '' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (authView) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Create Account';
      case 'changePassword': return 'Change Password';
      case 'forgotPassword': return 'Reset Password';
      default: return '';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-box">
        <h2>{getTitle()}</h2>

        {/* ── LOGIN VIEW ── */}
        {authView === 'login' && (
          <>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <button
                type="button"
                className="toggle-auth-btn forgot-link"
                onClick={() => switchView('forgotPassword')}
              >
                Forgot Password?
              </button>
            </form>
          </>
        )}

        {/* ── REGISTER VIEW (2-step OTP) ── */}
        {authView === 'register' && (
          <RegisterForm onSwitchToLogin={() => switchView('login')} />
        )}

        {/* ── CHANGE PASSWORD VIEW ── */}
        {authView === 'changePassword' && (
          <>
            <ChangePassword />
            <button
              type="button"
              className="toggle-auth-btn"
              onClick={() => switchView('login')}
            >
              ← Back to Login
            </button>
          </>
        )}

        {/* ── FORGOT PASSWORD VIEW (3-step OTP) ── */}
        {authView === 'forgotPassword' && (
          <ForgotPassword onBack={() => switchView('login')} />
        )}

        {/* ── BOTTOM TOGGLE: Login ↔ Register ── */}
        {(authView === 'login' || authView === 'register') && (
          <button
            onClick={() => switchView(authView === 'login' ? 'register' : 'login')}
            className="toggle-auth-btn"
          >
            {authView === 'login'
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
