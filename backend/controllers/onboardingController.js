import OnboardingApplication from "../models/OnboardingApplication.js";
import User from "../models/User.js";
import { uploadBufferToGridFS } from "../utils/gridfs.js";

function sanitizeFilename(name) {
  return String(name || "upload")
    .replace(/\\/g, "_")
    .replace(/\//g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

// ============================================
// Submit or Update Onboarding Application
// ============================================
export const submitApplication = async (req, res) => {
  try {
    const userId = req.userId; // from verifyToken middleware
    const applicationData = { ...req.body };

    // Parse JSON strings back to objects
    if (typeof applicationData.currentAddress === "string") {
      applicationData.currentAddress = JSON.parse(
        applicationData.currentAddress,
      );
    }
    if (typeof applicationData.emergencyContacts === "string") {
      applicationData.emergencyContacts = JSON.parse(
        applicationData.emergencyContacts,
      );
    }
    if (typeof applicationData.reference === "string") {
      applicationData.reference = JSON.parse(applicationData.reference);
    }

    // Persist uploaded files to MongoDB GridFS and store links
    if (req.files) {
      applicationData.documents = applicationData.documents || {};

      if (req.files.driverLicense) {
        const f = req.files.driverLicense[0];
        const original = sanitizeFilename(f.originalname);
        const uniqueName = `${userId}_${Date.now()}_${original}`;
        const fileId = await uploadBufferToGridFS({
          buffer: f.buffer,
          filename: uniqueName,
          contentType: f.mimetype,
          metadata: {
            userId,
            docType: "driverLicense",
            context: "onboarding",
            originalName: original,
          },
        });
        applicationData.documents.driverLicense = `/api/files/${fileId}/${encodeURIComponent(original)}`;
      }

      if (req.files.workAuthorization) {
        const f = req.files.workAuthorization[0];
        const original = sanitizeFilename(f.originalname);
        const uniqueName = `${userId}_${Date.now()}_${original}`;
        const fileId = await uploadBufferToGridFS({
          buffer: f.buffer,
          filename: uniqueName,
          contentType: f.mimetype,
          metadata: {
            userId,
            docType: "workAuthorization",
            context: "onboarding",
            originalName: original,
          },
        });
        applicationData.documents.workAuthorization = `/api/files/${fileId}/${encodeURIComponent(original)}`;
      }

      if (req.files.other) {
        const f = req.files.other[0];
        const original = sanitizeFilename(f.originalname);
        const uniqueName = `${userId}_${Date.now()}_${original}`;
        const fileId = await uploadBufferToGridFS({
          buffer: f.buffer,
          filename: uniqueName,
          contentType: f.mimetype,
          metadata: {
            userId,
            docType: "other",
            context: "onboarding",
            originalName: original,
          },
        });
        applicationData.documents.other = `/api/files/${fileId}/${encodeURIComponent(original)}`;
      }

      if (req.files.optReceipt) {
        const f = req.files.optReceipt[0];
        const original = sanitizeFilename(f.originalname);
        const uniqueName = `${userId}_${Date.now()}_${original}`;
        const fileId = await uploadBufferToGridFS({
          buffer: f.buffer,
          filename: uniqueName,
          contentType: f.mimetype,
          metadata: {
            userId,
            docType: "optReceipt",
            context: "onboarding",
            originalName: original,
          },
        });
        applicationData.documents.optReceipt = `/api/files/${fileId}/${encodeURIComponent(original)}`;
      }
      // Handle Profile Picture Upload
      if (req.files.profilePicture) {
        const f = req.files.profilePicture[0];
        const original = sanitizeFilename(f.originalname);
        const uniqueName = `${userId}_${Date.now()}_${original}`;
        const fileId = await uploadBufferToGridFS({
          buffer: f.buffer,
          filename: uniqueName,
          contentType: f.mimetype,
          metadata: {
            userId,
            docType: "profilePicture",
            context: "onboarding",
            originalName: original,
          },
        });
        // Save the URL to the profile_picture field
        applicationData.profile_picture = `/api/files/${fileId}/${encodeURIComponent(original)}`;
      }
    }

    // If no file uploaded but a default image string is provided in body
    if (!req.files?.profilePicture && req.body.profile_picture) {
        applicationData.profile_picture = req.body.profile_picture;
    }

    // check if there is an application
    // Check for existing application
    let application = await OnboardingApplication.findOne({ userId });

    // VALIDATION: Check for Work Authorization Document
    // Required if usResident is 'workAuth' AND visaTitle is NOT 'F1(CPT/OPT)'
    const isWorkAuthRequired =
      req.body.usResident === "workAuth" &&
      req.body.visaTitle !== "F1(CPT/OPT)";

    if (isWorkAuthRequired) {
      // Check if new file uploaded (in applicationData) OR existing file present (in DB)
      const hasNewFile = applicationData.documents?.workAuthorization;
      const hasExistingFile = application?.documents?.workAuthorization;

      if (!hasNewFile && !hasExistingFile) {
        return res.status(400).json({
          message:
            "Work Authorization Document is required for your visa status.",
        });
      }
    }

    if (application) {
      console.log("📝 Updating existing application");
      Object.assign(application, applicationData);
      application.status = "Pending";
      application.submittedAt = new Date();
    } else {

      console.log("📝 Creating new application");
      application = new OnboardingApplication({
        userId,
        ...applicationData,
        status: "Pending",
        submittedAt: new Date(),
      });
    }

    await application.save();
    console.log("✅ Application saved successfully");

    // update user onboarding Status
    await User.findByIdAndUpdate(userId, {
      onboardingStatus: "Pending",
    });
    console.log("✅ User status updated");

    res.status(200).json({
      message: "Onboarding application submitted successfully",
      application: application,
    });
  } catch (err) {
    console.error("❌ Submit application error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// ============================================
// Get Current User's Application
// ============================================
export const getMyApplication = async (req, res) => {
  try {
    const userId = req.userId;

    const application = await OnboardingApplication.findOne({ userId }).select(
      "+ssn",
    ); // Includes SSN (for users to view their own information)

    if (!application) {
      return res.status(404).json({
        message: "No application found",
      });
    }

    res.status(200).json({
      application: application,
    });
  } catch (err) {
    console.error("Get application error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ============================================
// Get Application Status
// ============================================
export const getApplicationStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const application = await OnboardingApplication.findOne({ userId }).select(
      "status feedback submittedAt reviewedAt",
    );

    if (!application) {
      // Self-heal: if application is deleted manually, keep User.onboardingStatus consistent.
      // This prevents the UI from showing stale Approved/Rejected/Pending.
      await User.findByIdAndUpdate(userId, {
        onboardingStatus: "Never Submitted",
      });
      return res.status(200).json({
        status: "Never Submitted",
      });
    }

    res.status(200).json({
      status: application.status,
      feedback: application.feedback,
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      ...(process.env.NODE_ENV === "development"
        ? {
            debug: {
              userId,
              applicationId: application._id,
              dbName: application.db?.name,
              collection: application.collection?.name,
            },
          }
        : {}),
    });
  } catch (err) {
    console.log("Get status error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ============================================
// Delete Current User's Application
// ============================================
export const deleteMyApplication = async (req, res) => {
  try {
    const userId = req.userId;

    const deleted = await OnboardingApplication.findOneAndDelete({ userId });

    // Keep user status consistent regardless of whether a record existed.
    await User.findByIdAndUpdate(userId, {
      onboardingStatus: "Never Submitted",
    });

    return res.status(200).json({
      message: deleted
        ? "Onboarding application deleted"
        : "No onboarding application found",
      deleted: Boolean(deleted),
    });
  } catch (err) {
    console.error("Delete application error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
