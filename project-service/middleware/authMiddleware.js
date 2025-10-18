const axios = require('axios');

// This middleware gets the token from the header, sends it to the Auth service for verification
// and attaches the decoded user to the request object if valid.
module.exports = async function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const authServiceUrl = `${process.env.AUTH_SERVICE_URL}/api/auth/verify`;
        const response = await axios.post(authServiceUrl, { token });
        
        // Add user from payload
        req.user = response.data.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};