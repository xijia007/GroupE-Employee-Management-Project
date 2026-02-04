import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
      default: "",
    },
    preferredName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    profile_picture: {
      type: String,
      default: "",
    },
    ssn: {
      type: String,
      required: true,
      select: false,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "I do not wish to answer"],
      required: true,
    },
    address: {
      building: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
        required: true,
      },
    },
    contactInfo: {
      cellPhone: {
        type: String,
        required: true,
      },
      workPhone: {
        type: String,
        default: "",
      },
    },
    visaInformation: {
      visaType: {
        type: String,
        required: true,
      },
      StartDate: {
        type: Date,
        required: true,
      },
      EndDate: {
        type: Date,
        required: true,
      },
    },
    emergencyContacts: [
      {
        firstName: {
          type: String,
          required: true,
        },
        lastName: {
          type: String,
          required: true,
        },
        middleName: {
          type: String,
          default: "",
        },
        phone: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        relationship: {
          type: String,
          required: true,
        },
      },
    ],
    documents: {
      driverLicense: {
        type: String,
        default: "",
      },
      workAuthorization: {
        type: String,
        default: "",
      },
      other: {
        type: String,
        default: "",
      },
    },

    // Additional profile fields can be added here
  },
  { timestamps: true },
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
