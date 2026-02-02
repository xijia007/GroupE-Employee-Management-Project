import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RegistrationToken from '../models/RegistrationToken.js';

// ============================================
// Verify the registration token 
// (returns token details, used to pre-fill the email address)
// ============================================
export const validateToken = async (req, res) => {
    try {
        const { token } = req.params;

        // Find the token
        const regToken = await RegistrationToken.findOne({ token });

        if (!regToken) {
            return res.status(404).json({
                message: 'Registration token not found.'
            });
        }

        // Check if the token has already been used
        if (regToken.status === 'Submitted') {
            return res.status(400).json({
                message: 'This registration token has already been used.'
            });
        }

        // Check if the token has expired (3 days = 259200 seconds)
        const now = new Date();
        const tokenAge = (now - regToken.createAt) / 1000;
        if (tokenAge > 259200) {
            return res.status(400).json({
                message: 'Registration token has expired.'
            });
        }

        // Returns token details
        res.status(200).json({
            email: regToken.email,
            name: regToken.name
        });

    } catch (err) {
        console.error('Validate token error:', err);
        res.status(500).json({
            message: "Server Error.",
            error: err.message
        });
    }
}

// ============================================
// User registration (via invitation token)
// ============================================
export const register = async (req, res) => {
    try {

        const { token, username, password } = req.body;

        // Validate required fields
        if (!token || !username || !password) {
            return res.status(400).json({
                message: 'Please provide token, username and password.'
            });
        }

        // Verify that the RegistrationToken exists and is valid.
        const regToken = await RegistrationToken.findOne({
            token,
            status: 'Sent'
        });

        if (!regToken) {
            return res.status(400).json({
                message: 'Invalid or already used registration token.'
            });
        }

        // Check if the token has expired
        const now = new Date();
        const tokenAge = (now - regToken.createAt) / 1000;
        if (tokenAge > 259200) {
            return res.status(400).json({
                message: 'Registration token has expired.'
            });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: 'Username already exists.'
            });
        }

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            password: hashedPassword,
            role: 'Employee',
            onboardingStatus: 'Never Submitted'
        });

        await newUser.save();

        // Update the RegistrationToken status to "used"
        regToken.status = 'Submitted';
        await regToken.save();

        // Returns a successful response (excluding the password)
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                onboardingStatus: newUser.onboardingStatus
            }
        });

    } catch (err) {
        console.error('Register Error', err);
        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

// ============================================
// User Login
// ============================================
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                message: "Please provide username and password."
            });
        }

        // Find the user (the password field needs to be included)
        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            })
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Generate Access Token
        const accessToken = jwt.sign(
            {
            userId: user._id,
            role: user.role
            },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '1h'}
        )

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Return the response
        res.status(200).json({
            message: 'Login Successful.',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                onboardingStatus: user.onboardingStatus
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

// ============================================
// Refresh Access Token
// ============================================
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({
                message: 'Refresh token is required'
            });
        }

        // Validate the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Get user information
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Generate a new Access Token
        const newAccessToken = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.status(200).json({
            accessToken: newAccessToken
        });

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Refresh token expired. Please login again.'
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid refresh token.'
            });
        }

        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
}