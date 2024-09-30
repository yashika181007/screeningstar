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
        
        // Log the decoded token and userId
        console.log('Token successfully verified:', decoded);
        
        // Assign the decoded ID (or any other data) to the request object
        req.userId = decoded.id;

        // Log session creation (if applicable)
        console.log('Session created for userId:', req.userId);

        // Move to the next middleware or route handler
        next();
    });
};

module.exports = verifyToken;
