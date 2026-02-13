import express from "express";
import {
  getUserProfile,
  UpdateUserProfile,
  uploadProfileDocument,
  uploadProfilePicture,
} from "../controllers/ProfileController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import { uploadSingleFile } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET /api/info/profile - Get current user's profile
router.get("/profile", verifyToken, getUserProfile);

// PUT /api/info/profile - Update current user's profile
router.put("/profile", verifyToken, UpdateUserProfile);

// POST /api/info/profile/picture - Upload profile picture
router.post(
  "/profile/picture",
  verifyToken,
  uploadSingleFile,
  uploadProfilePicture,
);

// POST /api/info/profile/documents/:docType - Upload visa status document and save to profile
router.post(
  "/profile/documents/:docType",
  verifyToken,
  uploadSingleFile,
  uploadProfileDocument,
);

export default router;
