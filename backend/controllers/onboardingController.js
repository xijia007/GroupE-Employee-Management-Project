import OnboardingApplication from "../models/OnboardingApplication.js";
import User from "../models/User.js";

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

    // handle the path for uploaded files
    if (req.files) {
      applicationData.documents = applicationData.documents || {};

      if (req.files.driverLicense) {
        applicationData.documents.driverLicense =
          req.files.driverLicense[0].path;
      }

      if (req.files.workAuthorization) {
        applicationData.documents.workAuthorization =
          req.files.workAuthorization[0].path;
      }

      if (req.files.other) {
        applicationData.documents.other = req.files.other[0].path;
      }
    }

    // check if there is an application
    let application = await OnboardingApplication.findOne({ userId });

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
