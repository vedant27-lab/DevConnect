// File: devconnect/frontend/src/pages/AuthPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import './AuthPage.css';

const AuthPage = () => {
  // authView controls what is shown in the card
  // 'login' | 'register' | 'changePassword'
  const [authView, setAuthView] = useState('login');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (authView === 'login') {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      }

      if (authView === 'register') {
        await register(
          formData.username,
          formData.email,
          formData.password
        );
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-box">
        <h2>
          {authView === 'login' && 'Login'}
          {authView === 'register' && 'Register'}
          {authView === 'changePassword' && 'Change Password'}
        </h2>

        {error && <p className="error-message">{error}</p>}

        {/* LOGIN VIEW */}
        {authView === 'login' && (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <button type="submit">Login</button>

            <button
              type="button"
              className="toggle-auth-btn"
              onClick={() => setAuthView('changePassword')}
            >
              Change Password
            </button>
          </form>
        )}

        {/* REGISTER VIEW */}
        {authView === 'register' && (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <button type="submit">Register</button>
          </form>
        )}

        {/* CHANGE PASSWORD VIEW */}
        {authView === 'changePassword' && (
          <>
            <ChangePassword />
            <button
              type="button"
              className="toggle-auth-btn"
              onClick={() => setAuthView('login')}
            >
              Back to Login
            </button>
          </>
        )}

        {/* BOTTOM TOGGLE */}
        {authView !== 'changePassword' && (
          <button
            onClick={() =>
              setAuthView(authView === 'login' ? 'register' : 'login')
            }
            className="toggle-auth-btn"
          >
            {authView === 'login'
              ? 'Need an account? Register'
              : 'Have an account? Login'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
