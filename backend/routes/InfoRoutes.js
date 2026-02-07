import express from "express";
import {
  getUserProfile,
  UpdateUserProfile,
} from "../controllers/ProfileController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/info/profile - Get current user's profile
router.get("/profile", verifyToken, getUserProfile);

// PUT /api/info/profile - Update current user's profile
router.put("/profile", verifyToken, UpdateUserProfile);

export default router;
