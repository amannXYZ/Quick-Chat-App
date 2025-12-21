const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Authorization header missing or invalid', success: false });
    }

    const token = authHeader.split(' ')[1]; // This line will throw if authHeader is undefined
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userId = decoded.userId; // Ensure this matches your JWT payload
        next();
    } catch (err) {
        return res.status(401).send({ message: 'Invalid or expired token', success: false });
    }
};