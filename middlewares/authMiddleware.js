const jwt = require('jsonwebtoken');
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'your_fallback_secret_key'; 


const authMiddleware = (req, res, next) => {
    //const authHeader = req.header('Authorization');
    const authHeader = req.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token not found or invalid format.' });
    }

    // Header format is "Bearer <token>"
    //const token = authHeader.replace('Bearer ', '');
    const token = authHeader.slice(7);

    // 2. Verify token
    try {
        // Verify the token using the secret from the environment
        const decoded = jwt.verify(token, TOKEN_SECRET);
        
        // 3. Attach user info to the request object
        // The payload you created in signin was: { userId, email, verified }
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            verified: decoded.verified
        };
        req.userId = decoded.userId;
        next(); // Proceed to the next middleware or the route handler
    } catch (err) {
        // Token is invalid (expired, corrupted, or wrong secret)
        console.error('JWT verification failed:', err.message);
        res.status(401).json({ message: 'Token is invalid or expired.' });
    }
};

module.exports = authMiddleware;