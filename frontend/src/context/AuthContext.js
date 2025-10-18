// File: devconnect/frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// Axios instance for API calls
const api = axios.create();

// Utility to set the auth token for all subsequent Axios requests
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

    const loadUser = useCallback(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            // Check if token is expired
            if (decoded.exp * 1000 < Date.now()) {
                logout();
            } else {
                setAuthToken(token);
                setUser(decoded.user);
                setIsAuthenticated(true);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (email, password) => {
        const res = await axios.post(`${process.env.REACT_APP_AUTH_API_URL}/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        loadUser();
    };

    const register = async (username, email, password) => {
        const res = await axios.post(`${process.env.REACT_APP_AUTH_API_URL}/register`, { username, email, password });
        localStorage.setItem('token', res.data.token);
        loadUser();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, api }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;