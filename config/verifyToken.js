const jwt = require('jsonwebtoken');

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
   
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    jwt.verify(tokenParts[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Token verification error:', err);
            return res.status(401).json({ message: 'Unauthorized!' });
        }

        req.userId = decoded.id;
        next();
    });
};

module.exports = verifyToken;
