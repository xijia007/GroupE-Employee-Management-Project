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
} from '../controllers/hrController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// Route 1: POST /api/hr/generate-token
// Function: Generates a registration token and sends an email.
// Permissions: Requires login (HR Only)
// Request Body: { email: string, name: string }
// Response: { message: string, token: object }
// ============================================
router.post("/generate-token", verifyToken, generateToken);

// ============================================
// Route 2: GET /api/hr/tokens
// Function: Get all registered token history
// Permissions: Login required (HR Only)
// Response: { count: number, tokens: array }
// ============================================
router.get("/tokens", verifyToken, getAllTokens);

// ============================================
// Route 3: GET /api/hr/applications
// Function: Get all application listings (supports status filtering)
// Permissions: Login required (HR Only)
// Query parameters: ?status=Pending|Approved|Rejected|All
// Response: { count: number, applications: array }
// ============================================
router.get("/applications", verifyToken, getAllApplications);

// ============================================
// Route 4: GET /api/hr/applications/:id
// Function: Get detailed information for a single application
// Permissions: Login required (HR Only)
// Path parameter: id - MongoDB ObjectId of the application
// Response: { application: object, user: object }
// ============================================
router.get("/applications/:id", verifyToken, getApplicationById);

// ============================================
// Route 5: PATCH /api/hr/applications/:id/review
// Function: Review an application (approve or reject)
// Permissions: Requires login (HR Only)
// Path Parameters: id - MongoDB ObjectId of the application
// Request Body: { status: "Approved"|"Rejected", feedback: string }
// Response: { message: string, application: object }
// ============================================
router.patch("/applications/:id/review", verifyToken, reviewApplication);

router.get("/onboarding-applications", verifyToken, getAllApplications);

router.get("/onboarding-applications/:id", verifyToken, getApplicationById);

router.patch(
  "/onboarding-applications/:id/review",
  verifyToken,
  reviewApplication,
);

router.get('/employees', verifyToken, getAllEmployees);
router.get('/employees/:id', verifyToken, getEmployeeById);

// Visa Status Review (OPT documents)
router.get("/visa-status", verifyToken, requireHR, getVisaStatusList);
router.patch(
  "/visa-status/:userId/documents/:docType/review",
  verifyToken,
  requireHR,
  reviewVisaDocument,
);

export default router;
