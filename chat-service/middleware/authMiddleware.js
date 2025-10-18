// File: devconnect/chat-service/middleware/authMiddleware.js
const axios = require('axios');

// This middleware is specifically for Socket.io connections
const authMiddlewareSocket = async (socket, next) => {
    // The token is sent from the client in the `auth` object during connection
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    try {
        const authServiceUrl = `${process.env.AUTH_SERVICE_URL}/api/auth/verify`;
        const response = await axios.post(authServiceUrl, { token });
        
        // Attach user info to the socket object for use in connection handlers
        socket.user = response.data.user;
        next();
    } catch (err) {
        console.error('Socket authentication failed:', err.message);
        next(new Error('Authentication error: Invalid token'));
    }
};

module.exports = authMiddlewareSocket;