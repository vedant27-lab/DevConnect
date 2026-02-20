// File: devconnect/frontend/src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu whenever route changes
    useEffect(() => setMenuOpen(false), [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
        setMenuOpen(false);
    };

    return (
        <nav className="navbar">
            {/* Brand */}
            <Link
                to={isAuthenticated ? '/dashboard' : '/auth'}
                className="navbar-brand"
                onClick={() => setMenuOpen(false)}
            >
                Dev<span>Connect</span>
            </Link>

            {/* Hamburger toggle (mobile only) */}
            <button
                className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
            >
                <span />
                <span />
                <span />
            </button>

            {/* Backdrop (mobile) */}
            {menuOpen && (
                <div className="navbar-backdrop" onClick={() => setMenuOpen(false)} />
            )}

            {/* Links */}
            <div className={`navbar-links ${menuOpen ? 'nav-open' : ''}`}>
                {isAuthenticated ? (
                    <>
                        <span className="navbar-welcome">
                            👋 <strong>{user?.username}</strong>
                        </span>
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <button onClick={handleLogout} className="navbar-logout-btn">
                            ↪ Logout
                        </button>
                    </>
                ) : (
                    <Link to="/auth" className="nav-link">Login / Register</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;