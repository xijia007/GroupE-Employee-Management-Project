import express from "express";
import {
  generateToken,
  getAllTokens,
  getAllApplications,
  getApplicationById,
  reviewApplication,
  getAllEmployees,
  getEmployeeById,
  getVisaStatusList,
  reviewVisaDocument,
  sendVisaStatusReminder,
} from "../controllers/hrController.js";
import { verifyToken, requireHR } from "../middleware/authMiddleware.js";

import { validateRequest } from "../middleware/validationMiddleware.js";
import {
  generateTokenSchema,
  reviewApplicationSchema,
  reviewVisaDocumentSchema,
  sendVisaReminderSchema,
} from "../schemas/zodSchemas.js";

const router = express.Router();

// Route 1: Generate registration token and send email
router.post(
  "/generate-token",
  verifyToken,
  requireHR,
  validateRequest(generateTokenSchema),
  generateToken,
);

// Route 2: Get all registration tokens
router.get("/tokens", verifyToken, requireHR, getAllTokens);

// Route 3: Get all applications (supports status filtering)
router.get("/applications", verifyToken, requireHR, getAllApplications);

// Route 4: Get application details by ID
router.get("/applications/:id", verifyToken, requireHR, getApplicationById);

// Route 5: Review application (approve/reject)
router.patch(
  "/applications/:id/review",
  verifyToken,
  requireHR,
  validateRequest(reviewApplicationSchema),
  reviewApplication,
);

router.get("/employees", verifyToken, requireHR, getAllEmployees);
router.get("/employees/:id", verifyToken, requireHR, getEmployeeById);

// Visa Status Review (OPT documents)
router.get("/visa-status", verifyToken, requireHR, getVisaStatusList);
router.patch(
  "/visa-status/:userId/documents/:docType/review",
  verifyToken,
  requireHR,
  validateRequest(reviewVisaDocumentSchema),
  reviewVisaDocument,
);

router.post(
  "/visa-status/:userId/notify",
  verifyToken,
  requireHR,
  validateRequest(sendVisaReminderSchema),
  sendVisaStatusReminder,
);

export default router;
