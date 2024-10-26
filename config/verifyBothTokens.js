const jwt = require('jsonwebtoken');
const config = require('../config');
const { isTokenBlacklisted } = require('./blacklist');

const verifyBothTokens = (req, res, next) => {
    const authToken = req.headers['authorization'];
    const clientToken = req.headers['clienttoken'];

    if (!authToken || !clientToken) {
        return res.status(403).json({ message: 'Both tokens are required.' });
    }

    const authTokenParts = authToken.split(' ');
    const jwtAuthToken = authTokenParts[0] === 'Bearer' ? authTokenParts[1] : authToken;
    const jwtClientToken = clientToken;

    // Check if either token is blacklisted
    if (isTokenBlacklisted(jwtAuthToken) || isTokenBlacklisted(jwtClientToken)) {
        return res.status(401).json({ message: 'One or both tokens have been blacklisted. Please log in again.' });
    }

    try {
        // Verify auth token
        const decodedAuthToken = jwt.verify(jwtAuthToken, process.env.jwtSecret);
        req.userId = decodedAuthToken.id;
        req.userRole = decodedAuthToken.role;

        // Verify client token
        const decodedClientToken = jwt.verify(jwtClientToken, process.env.jwtSecret);
        req.clientId = decodedClientToken.clientId;
        req.branchId = decodedClientToken.branchId;

        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Unauthorized! Invalid or expired token.' });
    }
};

module.exports = verifyBothTokens;
