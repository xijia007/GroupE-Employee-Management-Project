import express from 'express';
import { validateToken, register, login, refreshToken, logout } from '../controllers/authController.js';

import { validateRequest } from '../middleware/validationMiddleware.js';
import { loginSchema, registerSchema } from '../schemas/zodSchemas.js';

const router = express.Router();

// GET /api/auth/registration-token/:token 
// - Validates the registration token and returns details.
router.get('/registration-token/:token', validateToken);

// POST /api/auth/register 
// - User registration
router.post('/register', validateRequest(registerSchema), register);

// POST /api/auth/login 
// - User login
router.post('/login', validateRequest(loginSchema), login);

// POST /api/auth/refresh 
// - Refresh Access Token
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
