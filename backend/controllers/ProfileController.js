import Profile from "../models/Profile.js";
import mongoose from "mongoose";

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await Profile.findOne({
      user: new mongoose.Types.ObjectId(userId),
    });
    if (!profile) {
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
    const userId = req.user.userId;
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

export { getUserProfile, UpdateUserProfile };
