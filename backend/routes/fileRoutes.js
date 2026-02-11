import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { streamFile } from "../controllers/fileController.js";

const router = express.Router();

// GET /api/files/:id and /api/files/:id/:name
// Streams the file stored in GridFS.
// - Requires auth (Bearer token)
// - Owner or HR can access
// - Use ?download=1 for attachment
router.get("/:id", verifyToken, streamFile);
router.get("/:id/:name", verifyToken, streamFile);

export default router;
