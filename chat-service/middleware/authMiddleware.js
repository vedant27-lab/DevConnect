const axios = require('axios');

const authMiddlewareSocket = async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    try {
        const authServiceUrl = `${process.env.AUTH_SERVICE_URL}/api/auth/verify`;
        const response = await axios.post(authServiceUrl, { token });
        
        socket.user = response.data.user;
        next();
    } catch (err) {
        console.error('Socket authentication failed:', err.message);
        next(new Error('Authentication error: Invalid token'));
    }
};

module.exports = authMiddlewareSocket;