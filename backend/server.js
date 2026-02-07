import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import infoRoutes from "./routes/InfoRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Employee Management API",
    version: "1.0.0",
    status: "running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/info", infoRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Then start the server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
