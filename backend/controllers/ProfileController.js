import Profile from "../models/Profile.js";
import mongoose from "mongoose";

const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // From verifyToken middleware
    console.log("Getting profile for userId:", userId);

    const profile = await Profile.findOne({
      user: new mongoose.Types.ObjectId(userId),
    }).select("+ssn"); // Include SSN for user viewing their own profile

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
    const profile = await Profile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      updateData,
      { new: true, runValidators: true },
    );
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
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

    const allowedDocTypes = new Set(["optReceipt", "optEad", "i983", "i20"]);
    if (!allowedDocTypes.has(docType)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Normalize Windows backslashes so frontend can build a valid /uploads URL
    const filePath = String(req.file.path).replace(/\\/g, "/"); // e.g. uploads/documents/<filename>

    const profile = await Profile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          [`documents.${docType}`]: filePath,
          [`visaDocuments.${docType}.status`]: "pending",
          [`visaDocuments.${docType}.feedback`]: "",
          [`visaDocuments.${docType}.reviewedAt`]: null,
        },
      },
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