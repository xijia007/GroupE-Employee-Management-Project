import express from "express";
import {
  submitApplication,
  getMyApplication,
  getApplicationStatus,
  deleteMyApplication,
} from "../controllers/onboardingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  uploadSingleFile,
  uploadRequiredDocuments,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

// POST /api/onboarding/submit
// - Submit or update onboarding application (with file uploads)
// - Protected: requires authentication
router.post("/submit", verifyToken, uploadRequiredDocuments, submitApplication);

// GET /api/onboarding/my-application
// - Get current user's application details
// - Protected: requires authentication
router.get("/my-application", verifyToken, getMyApplication);

// GET /api/onboarding/status
// - Get application status (quick check)
// - Protected: requires authentication
router.get("/status", verifyToken, getApplicationStatus);

// DELETE /api/onboarding/my-application
// - Delete current user's onboarding application (reset to Never Submitted)
// - Protected: requires authentication
router.delete("/my-application", verifyToken, deleteMyApplication);

export default router;
