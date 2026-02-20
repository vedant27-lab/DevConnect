import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const api = axios.create();

const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete api.defaults.headers.common['x-auth-token'];
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const loadUser = useCallback(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setAuthToken(token);
                    setUser(decoded.user);
                    setIsAuthenticated(true);
                }
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    }, [logout]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (email, password) => {
        const res = await axios.post(`${process.env.REACT_APP_AUTH_API_URL}/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        loadUser();
    };

    // Step 1 of registration: validates username+email and sends OTP
    const requestRegisterOtp = async (username, email) => {
        return await axios.post(
            `${process.env.REACT_APP_AUTH_API_URL}/request-register-otp`,
            { username, email }
        );
    };

    // Step 2 of registration: submits all details + OTP → creates account
    const register = async (username, email, password, otp) => {
        const res = await axios.post(`${process.env.REACT_APP_AUTH_API_URL}/register`, { username, email, password, otp });
        localStorage.setItem('token', res.data.token);
        loadUser();
    };

    // FIX: was only passing newPassword (1 arg) — backend requires both oldPassword and newPassword
    const changePassword = async (oldPassword, newPassword) => {
        const token = localStorage.getItem('token');
        return await axios.post(
            `${process.env.REACT_APP_AUTH_API_URL}/changePassword`,
            { oldPassword, newPassword },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
    };

    // ── Forgot Password ──────────────────────────────────────────────
    const requestForgotPasswordOtp = async (email) => {
        return await axios.post(
            `${process.env.REACT_APP_AUTH_API_URL}/forgot-password/request-otp`,
            { email }
        );
    };

    const verifyForgotPasswordOtp = async (email, otp) => {
        return await axios.post(
            `${process.env.REACT_APP_AUTH_API_URL}/forgot-password/verify-otp`,
            { email, otp }
        );
    };

    const resetPassword = async (email, otp, newPassword) => {
        return await axios.post(
            `${process.env.REACT_APP_AUTH_API_URL}/forgot-password/reset`,
            { email, otp, newPassword }
        );
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            login,
            register,
            requestRegisterOtp,
            logout,
            changePassword,
            requestForgotPasswordOtp,
            verifyForgotPasswordOtp,
            resetPassword,
            api
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;