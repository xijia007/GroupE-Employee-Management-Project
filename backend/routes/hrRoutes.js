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

// ============================================
// Route 1: POST /api/hr/generate-token
// Function: Generates a registration token and sends an email.
// Permissions: Requires login (HR Only)
// Request Body: { email: string, name: string }
// Response: { message: string, token: object }
// ============================================
router.post(
  "/generate-token",
  verifyToken,
  requireHR,
  validateRequest(generateTokenSchema),
  generateToken,
);

// ============================================
// Route 2: GET /api/hr/tokens
// Function: Get all registered token history
// Permissions: Login required (HR Only)
// Response: { count: number, tokens: array }
// ============================================
router.get("/tokens", verifyToken, requireHR, getAllTokens);

// ============================================
// Route 3: GET /api/hr/applications
// Function: Get all application listings (supports status filtering)
// Permissions: Login required (HR Only)
// Query parameters: ?status=Pending|Approved|Rejected|All
// Response: { count: number, applications: array }
// ============================================
router.get("/applications", verifyToken, requireHR, getAllApplications);

// ============================================
// Route 4: GET /api/hr/applications/:id
// Function: Get detailed information for a single application
// Permissions: Login required (HR Only)
// Path parameter: id - MongoDB ObjectId of the application
// Response: { application: object, user: object }
// ============================================
router.get("/applications/:id", verifyToken, requireHR, getApplicationById);

// ============================================
// Route 5: PATCH /api/hr/applications/:id/review
// Function: Review an application (approve or reject)
// Permissions: Requires login (HR Only)
// Path Parameters: id - MongoDB ObjectId of the application
// Request Body: { status: "Approved"|"Rejected", feedback: string }
// Response: { message: string, application: object }
// ============================================
router.patch(
  "/applications/:id/review",
  verifyToken,
  requireHR,
  validateRequest(reviewApplicationSchema),
  reviewApplication,
);

router.get("/onboarding-applications", verifyToken, requireHR, getAllApplications);

router.get("/onboarding-applications/:id", verifyToken, requireHR, getApplicationById);

router.patch(
  "/onboarding-applications/:id/review",
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
