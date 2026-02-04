import express from "express";
import {
  getUserProfile,
  UpdateUserProfile,
} from "../controllers/ProfileController.js";
import { requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", getUserProfile);
router.put("/profile", requireRole("Employee"), UpdateUserProfile);

export default router;
