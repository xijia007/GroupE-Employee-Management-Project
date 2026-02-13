import Profile from "../models/Profile.js";
import mongoose from "mongoose";
import { uploadBufferToGridFS } from "../utils/gridfs.js";

function sanitizeFilename(name) {
  return String(name || "upload")
    .replace(/\\/g, "_")
    .replace(/\//g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    let profile = await Profile.findOne({
      user: new mongoose.Types.ObjectId(userId),
    }).select("+ssn"); // Include SSN for user viewing their own profile

    // Self-healing: If profile missing but user is approved, try to create it from application
    if (!profile) {
      console.log("Profile not found. Checking for approved application...");
      const OnboardingApplication = (
        await import("../models/OnboardingApplication.js")
      ).default;
      const User = (await import("../models/User.js")).default;

      const application = await OnboardingApplication.findOne({
        userId,
      }).select("+ssn");
      // Note: User model might not be needed if we trust the token userId, but good for validation.

      if (application && application.status === "Approved") {
        console.log("Found approved application. Auto-creating profile...");

        const profileData = {
          user: userId,
          firstName: application.firstName,
          lastName: application.lastName,
          middleName: application.middleName || "",
          preferredName: application.preferredName || "",
          email: application.email,
          ssn: application.ssn,
          dateOfBirth: application.dateOfBirth,
          gender: application.gender,
          profile_picture: application.profile_picture || "",
          address: { ...application.currentAddress },
          contactInfo: {
            cellPhone: application.cellPhone,
            workPhone: application.workPhone || "",
          },
          // Visa Info Mapping
          visaInformation: {
            visaType:
              application.usResident === "usCitizen"
                ? "US Citizen"
                : application.usResident === "greenCard"
                  ? "Green Card"
                  : application.visaTitle || "",
            StartDate:
              application.usResident === "workAuth"
                ? application.visaStartDate || null
                : null,
            EndDate:
              application.usResident === "workAuth"
                ? application.visaEndDate || null
                : null,
          },
          emergencyContacts: application.emergencyContacts || [],
          documents: {
            driverLicense: application.documents?.driverLicense || "",
            workAuthorization: application.documents?.workAuthorization || "",
            other: application.documents?.other || "",
            optReceipt: application.documents?.optReceipt || "",
          },
        };

        try {
          profile = await Profile.create(profileData);
          console.log("Profile auto-created successfully.");
        } catch (createErr) {
          console.error("Auto-create profile failed:", createErr);
          // Fall through to 404 if creation fails
        }
      }
    }

    // Self-healing: If profile exists but OPT receipt was uploaded during onboarding,
    // copy it over so the visa status flow doesn't ask for a re-upload.
    if (profile && !profile?.documents?.optReceipt) {
      try {
        const OnboardingApplication = (
          await import("../models/OnboardingApplication.js")
        ).default;

        const application = await OnboardingApplication.findOne({
          userId,
        }).select("status documents.optReceipt");

        const optReceipt = application?.documents?.optReceipt;
        if (application?.status === "Approved" && optReceipt) {
          profile = await Profile.findOneAndUpdate(
            { user: new mongoose.Types.ObjectId(userId) },
            { $set: { "documents.optReceipt": optReceipt } },
            { new: true, runValidators: true },
          ).select("+ssn");
        }
      } catch (syncErr) {
        console.error(
          "Failed to sync onboarding optReceipt to profile:",
          syncErr,
        );
      }
    }

    if (!profile) {
      console.log("Profile not found for userId:", userId);
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const UpdateUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // From verifyToken middleware
    const updateData = req.body;

    // Use $set to ensure fields are updated, and handle potential dot notation if needed by frontend,
    // though usually frontend sends object.
    // Explicitly using $set is safer to avoid accidental replacement of root document if something is malformed,
    // although Mongoose treats top-level keys as $set by default.
    // However, for consistency and ensuring we are doing an update:

    const profile = await Profile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log("Profile updated successfully for user:", userId);
    res.status(200).json(profile);
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const uploadProfileDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const { docType } = req.params;

    const visaDocTypes = new Set(["optReceipt", "optEad", "i983", "i20"]);
    const allowedDocTypes = new Set([
      "driverLicense",
      "workAuthorization",
      "other",
      ...visaDocTypes,
    ]);
    if (!allowedDocTypes.has(docType)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const safeOriginalName = sanitizeFilename(req.file.originalname);
    const uniqueName = `${userId}_${Date.now()}_${safeOriginalName}`;

    const fileId = await uploadBufferToGridFS({
      buffer: req.file.buffer,
      filename: uniqueName,
      contentType: req.file.mimetype,
      metadata: {
        userId,
        docType,
        context: "profile",
        originalName: safeOriginalName,
      },
    });

    const filePath = `/api/files/${fileId}/${encodeURIComponent(safeOriginalName)}`;

    const updateSet = {
      [`documents.${docType}`]: filePath,
    };

    // Only visa-status documents participate in the HR review workflow.
    if (visaDocTypes.has(docType)) {
      updateSet[`visaDocuments.${docType}.status`] = "pending";
      updateSet[`visaDocuments.${docType}.feedback`] = "";
      updateSet[`visaDocuments.${docType}.reviewedAt`] = null;
    }

    const profile = await Profile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      { $set: updateSet },
      { new: true, runValidators: true },
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({
      message: "Document uploaded successfully",
      docType,
      path: filePath,
      profile,
    });
  } catch (err) {
    console.error("Upload Profile Document Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export { getUserProfile, UpdateUserProfile, uploadProfileDocument };
