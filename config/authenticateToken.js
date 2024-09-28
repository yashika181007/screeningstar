const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(403).json({ message: 'No token provided. Access denied.' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.jwtSecret); // Verifies token
        req.user = decoded; // Attach user data to request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = authenticateToken;
