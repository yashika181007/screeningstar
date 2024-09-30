const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        console.log('No token provided.');
        return res.status(403).json({ message: 'No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(401).json({ message: 'Unauthorized!' });
        }
        
        console.log('Token successfully verified:', decoded);

        req.userId = decoded.id;

        console.log('Session created for userId:', req.userId);

        next();
    });
};

module.exports = verifyToken;
