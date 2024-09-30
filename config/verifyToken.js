const verifyToken = (req, res, next) => {
    const token = req.session.token;
    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded; 
        next(); 
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
