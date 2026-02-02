import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware for validating Access Tokens

export const verifyToken = async(req, res, next) => {
    try {
    // Get the token from the request header.
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "No token provided or invalid format"
        });
    }

    // Extract the token (remove the "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    // Validate token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach the user ID and role to the request object
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();

    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: 'Token Expired' });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(403).json({ message: 'Invalid Token' });
        }
        return res.status(500).json({ message: 'Server Error' });
    };
};

// Middleware (higher-order function) for validating user roles
export const requireRole = (roles) => {
    return async (req, res, next) => {
        try {
            // Retrieve complete user information from the database
            const user = await User.findById(req.userId);

            if (!user) {
                return res.status(404).json({ message: 'User not Found'});
            }

            // Check if the user's role is in the list of allowed roles.
            if (!roles.includes(user.role)) {
                return res.status(403).json({ message: 'Access Denied. Insufficient permissions.'});
            }

            // Attach complete user information to the request
            req.user = user;

            next();

        } catch (err) {
            return res.status(500).json({ message: 'Server Error', error: err.message });
        }
    };
};