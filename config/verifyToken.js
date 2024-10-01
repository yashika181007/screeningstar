const jwt = require('jsonwebtoken');
const config = require('../config');
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log('Incoming request headers:', req.headers);
    if (!token) {
        return res.status(403).json({ message: 'No token provided.' });
    }

    const tokenParts = token.split(' ');
    if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
        return res.status(401).json({ message: 'Invalid token format.' });
    }
   
    console.log('jwtSecret:', process.env.jwtSecret);

    jwt.verify(tokenParts[1], process.env.jwtSecret, (err, decoded) => {
        if (err) {
            console.log('Token verification error:', err);
            return res.status(401).json({ message: 'Unauthorized!' });
        }

        req.userId = decoded.id;
        console.log('userId',req.userId)
        next();
    });
};

module.exports = verifyToken;
