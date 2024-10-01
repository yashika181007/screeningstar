const jwt = require('jsonwebtoken');
const config = require('../config');
const { isTokenBlacklisted } = require('./blacklist');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    // console.log('Incoming request headers:', req.headers);

    if (!token) {
        return res.status(403).json({ message: 'No token provided.' });
    }

    const tokenParts = token.split(' ');
    if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
        return res.status(401).json({ message: 'Invalid token format.' });
    }
    const jwtToken = tokenParts[1];

    if (isTokenBlacklisted(jwtToken)) {
        return res.status(401).json({ message: 'Token has been blacklisted. Please log in again.' });
    }

    jwt.verify(jwtToken, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                console.log('Token has expired:', err);
                return res.status(401).json({ message: 'Token has expired. Please log in again.' });
            }
            console.log('Token verification error:', err);
            return res.status(401).json({ message: 'Unauthorized!' });
        }
        req.user_id = decoded.id;
        req.role = decoded.role;
        console.log('userId:', req.user_id);
        console.log('role:', req.role);
        next();
    });
};

module.exports = verifyToken;
