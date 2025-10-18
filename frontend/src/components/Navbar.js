// File: devconnect/frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <nav className="navbar">
            <Link to={isAuthenticated ? "/dashboard" : "/auth"} className="navbar-brand">DevConnect</Link>
            <div className="navbar-links">
                {isAuthenticated ? (
                    <>
                        <span className="navbar-welcome">Welcome, {user?.username}</span>
                        <Link to="/dashboard">Dashboard</Link>
                        <button onClick={handleLogout} className="navbar-logout-btn">Logout</button>
                    </>
                ) : (
                    <Link to="/auth">Login / Register</Link>
                )}
            </div>
        </nav>
    );
};
export default Navbar;