// ============================================
// HR Controller - HR Management Controller
// Functions:
//   1. Generate registration tokens and send emails
//   2. Retrieve all registration token history
//   3. Retrieve all application lists (supports status filtering)
//   4. Retrieve details of a single application
//   5. Review applications (approve/reject)
// ============================================

import RegistrationToken from "../models/RegistrationToken.js";
import OnboardingApplication from "../models/OnboardingApplication.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import {
  normalizeStatusKey,
  normalizeStatusValue,
} from "../utils/statusUtils.js";
import {
  sendRegistrationEmail,
  sendApplicationStatusEmail,
  sendVisaStatusReminderEmail,
} from "../utils/emailService.js";
import crypto, { subtle } from "crypto";

// ============================================
// generateToken:
// Function: Generates a registration token and sends an email.
// Route: POST /api/hr/generate-token
// Request Body: { email: string, name: string }
// Response: { message: string, token: object }
// ============================================
export const generateToken = async (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    // Extract data from the request body
    const { email, name } = req.body;

    // Validate required fields
    // If any required fields are missing, return 400 Bad Request
    if (!email || !name) {
      return res.status(400).json({
        message: "Email and name are required.",
      });
    }

    // Check if a valid token already exists.
    // Purpose: To prevent generating duplicate tokens for the same email address.
    // Conditions:
    //   1. Email address matches
    //   2. Status is 'Sent' or 'Pending' (unused)
    //   3. Not expired (expiresAt > current time)
    const existingToken = await RegistrationToken.findOne({
      email,
      status: { $in: ["Sent", "Pending"] }, // $in: MongoDB operator, matches elements within an array.
      expiresAt: { $gt: new Date() }, // $gt: greater than, greater than the current time
    });

    if (existingToken) {
      return res.status(400).json({
        message: "A valid registration token already exists for this email.",
      });
    }

    // Generate a random token
    // crypto.randomBytes(32): Generates 32 bytes of random data
    // .toString('hex'): Converts to a hexadecimal string (64 characters)
    // Example output: 'a3f7c9d2e8b1...' (64-bit)
    const token = crypto.randomBytes(32).toString("hex");

    const registrationLink = `${frontendUrl}/register?token=${token}`;

    // Set the expiration time (3 hours from now)
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    // Create and save the token record.
    const registrationToken = new RegistrationToken({
      token, // Generated token
      email, // Recipient's email address
      name, // Recipient's name
      status: "Sent", // Status: Sent
      expiresAt,
    });

    await registrationToken.save(); // Save to the database

    // Sending email (with error handling)
    // Note: The token is generated even if the email sending fails.
    // HR can manually copy and send the link.
    try {
      // Call the email service to send the registration email.
      await sendRegistrationEmail(email, name, token);

      // Email sent successfully
      res.status(201).json({
        message: "Registration token generated and email sent successfully",
        token: {
          email,
          name,
          expiresAt,
          registrationLink,
        },
      });
    } catch (emailError) {
      // Email sending failed, but the token has been generated.
      console.error("Email sending failed:", emailError);
      res.status(201).json({
        message: "Token generated but email failed to send",
        token: {
          email,
          name,
          expiresAt,
          registrationLink,
        },
        emailError: emailError.message, // Returns error information for debugging.
      });
    }
  } catch (err) {
    // Global error handling
    console.error("Generate token error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ============================================
// getAllTokens:
// Function: Retrieves all registered token history
// Route: GET /api/hr/tokens
// Response: { count: number, tokens: array }
// ============================================

export const getAllTokens = async (req, res) => {
  try {
    // Query all tokens
    // .select('-token'): Exclude the token field (for security reasons)
    // .sort({ createdAt: -1 }): Sort in descending order by creation time
    const tokens = await RegistrationToken.find()
      .select("email name status expiresAt createdAt token")
      .sort({ createdAt: -1 });

    const tokenEmails = tokens.map((token) => token.email);
    const submittedApplications = await OnboardingApplication.find({
      email: { $in: tokenEmails },
    }).select("email");

    const submittedEmails = new Set(
      submittedApplications.map((app) => app.email),
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const tokensWithLinks = tokens.map((token) => ({
      _id: token._id,
      email: token.email,
      name: token.name,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      registrationLink: `${frontendUrl}/register?token=${token.token}`,
      onboardingSubmitted: submittedEmails.has(token.email),
    }));

    res.status(200).json({
      count: tokensWithLinks.length,
      tokens: tokensWithLinks,
    });
  } catch (err) {
    console.error("Get tokens error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ============================================
// getAllApplications:
// Function: Retrieves all job applications (supports status filtering)
// Route: GET /api/hr/applications?status=Pending
// Query Parameters: status (optional): 'Pending' | 'Approved' | 'Rejected' | 'All'
// Response: { count: number, applications: array }
// ============================================

export const getAllApplications = async (req, res) => {
  try {
    // Retrieve the status filter condition from the query parameters.
    // Example: GET /api/hr/applications?status=Pending
    // req.query.status = 'Pending'
    const { status } = req.query;

    // Building the query conditions
    // If status exists and is not 'All', filter by status
    // Otherwise, return all applications
    const query = {};
    if (status && status !== "All") {
      query.status = status;
    }

    // Querying the application list
    // .select('-ssn -documents'): Do not return sensitive information
    // .sort({ submittedAt: -1 }): Sort in descending order by submission time
    const applications = await OnboardingApplication.find(query)
      .select("-ssn -documents")
      .sort({ submittedAt: -1 });

    // Add user information to each application
    // Note: OnboardingApplication only contains userId
    // The username and email need to be retrieved from the User table.
    const applicationWithUser = await Promise.all(
      applications.map(async (app) => {
        const user = await User.findById(app.userId).select("username email");

        return {
          ...app.toObject(), // Convert Mongoose document to a plain object
          status: normalizeStatusValue(app.status),
          user, // Add user information
        };
      }),
    );

    res.status(200).json({
      count: applicationWithUser.length,
      applications: applicationWithUser,
    });
  } catch (err) {
    console.error("Get applications error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ============================================
// getApplicationById:
// Function: Retrieves detailed information for a single application
// Route: GET /api/hr/applications/:id
// Parameters: id - the MongoDB ObjectId of the application
// Response: { application: object, user: object }
// ============================================

export const getApplicationById = async (req, res) => {
  try {
    // Get the application ID from the route parameters
    // Example: GET /api/hr/applications/65c1234567890abcdef
    // req.params.id = '65c1234567890abcdef'
    const { id } = req.params;

    // Search for applications by ID.
    const application = await OnboardingApplication.findById(id);

    // If the application does not exist, return 404.
    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Retrieve the corresponding user information.
    const user = await User.findById(application.userId).select(
      "username email role",
    );

    // Return complete information (including sensitive fields)
    // Note: This is the details page; HR needs to see all the information.
    res.status(200).json({
      application: {
        ...application.toObject(),
        status: normalizeStatusValue(application.status),
      },
      user,
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
// ReviewApplication:
// Function: Review an application (approve or reject)
// Route: PATCH /api/hr/applications/:id/review
// Request Body: { status: "Approved" | "Rejected", feedback: string }
// Response: { message: string, application: object }
// ============================================

export const reviewApplication = async (req, res) => {
  try {
    // Extract parameters
    const { id } = req.params; // Application ID
    const { status, feedback } = req.body; // Review status and feedback
    const hrUserId = req.userId; // HR user ID (from JWT)

    // Validate the status value
    // Only 'Approved' or 'Rejected' are allowed.
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either "Approved" or "Rejected"',
      });
    }

    // Search for applications (include SSN for profile creation)
    const application = await OnboardingApplication.findById(id).select("+ssn");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (status === "Approved") {
      const isWorkAuth = application.usResident === "workAuth";
      const visaTitle = String(application.visaTitle || "").trim();
      const isF1 = /^f1/i.test(visaTitle);

      // Onboarding approval should only enforce onboarding-stage required docs.
      // Later OPT documents (EAD/I-983/I-20) belong to Visa Status workflow.
      if (isWorkAuth && isF1 && !application.documents?.optReceipt) {
        return res.status(400).json({
          message:
            "Cannot approve onboarding for F1 employee without OPT Receipt.",
        });
      }

      if (isWorkAuth && !isF1 && !application.documents?.workAuthorization) {
        return res.status(400).json({
          message:
            "Cannot approve onboarding without work authorization document.",
        });
      }
    }

    // Update application status
    application.status = status; // 'Approved' or 'Rejected'
    application.feedback = feedback || ""; // HR feedback(optional)
    application.reviewedAt = new Date(); // Review time
    application.reviewedBy = hrUserId; // Reviewer (HR's userId)

    await application.save(); // Save changes

    // Synchronously update the user's onboardingStatus
    // Purpose: To allow users to quickly retrieve their status upon login.
    await User.findByIdAndUpdate(application.userId, {
      onboardingStatus: status,
    });

    // If approved, create/update Profile with application data
    if (status === "Approved") {
      try {
        // Map OnboardingApplication data to Profile structure
        const profileData = {
          user: application.userId,
          firstName: application.firstName,
          lastName: application.lastName,
          middleName: application.middleName || "",
          preferredName: application.preferredName || "",
          email: application.email,
          ssn: application.ssn,
          dateOfBirth: application.dateOfBirth,
          gender: application.gender,
          profile_picture: application.profile_picture || "",

          // Address mapping: currentAddress -> address
          address: {
            building: application.currentAddress.building,
            street: application.currentAddress.street,
            city: application.currentAddress.city,
            state: application.currentAddress.state,
            zip: application.currentAddress.zip,
          },

          // Contact info mapping
          contactInfo: {
            cellPhone: application.cellPhone,
            workPhone: application.workPhone || "",
          },

          // Visa information mapping based on residency
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

          // Emergency contacts
          emergencyContacts: application.emergencyContacts || [],

          // Documents
          documents: {
            driverLicense: application.documents?.driverLicense || "",
            workAuthorization: application.documents?.workAuthorization || "",
            other: application.documents?.other || "",
            optReceipt: application.documents?.optReceipt || "",
          },
          
          // Initialize Visa Document Status if OPT Receipt is provided
          ...(application.documents?.optReceipt ? {
            visaDocuments: {
              optReceipt: {
                status: "pending", // Set as pending so HR can review in Visa Management
                reviewedAt: null,
                feedback: ""
              }
            }
          } : {}),
        };

        // Upsert Profile: update if exists, create if not
        const updatedProfile = await Profile.findOneAndUpdate(
          { user: application.userId },
          { $set: profileData },
          {
            upsert: true, // Create if doesn't exist
            new: true, // Return updated document
            runValidators: true, // Run schema validation
          },
        );
        console.log("Profile upserted successfully:");
      } catch (profileError) {
        console.error("Error creating/updating profile:", profileError);
        // Don't fail the approval if profile creation fails
        // HR can manually create profile later
      }
    }

    // Sending status notification email
    // Note: The review is considered complete even if the email fails to send.
    try {
      await sendApplicationStatusEmail(
        application.email, // Recipient's email address
        application.firstName, // Recipient's email firstName
        status, // 'Approved' or 'Rejected'
        feedback,
      );
    } catch (emailError) {
      console.error("Status email failed:", emailError); // This does not affect the main process; execution continues.
    }

    // Return a successful response.
    res.status(200).json({
      message: `Application ${status.toLowerCase()} successfully`,
      application,
    });
  } catch (err) {
    console.error("Review application error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ============================================
// getAllEmployees:
// Function: Get all registered employees with their onboarding status
// Route: GET /api/hr/employees?status=All|Pending|Approved|Rejected|Never Submitted
// Query Parameters: status (optional)
// Response: { count: number, employees: array }
// ============================================
export const getAllEmployees = async (req, res) => {
  try {
    const { status, search } = req.query;

    let users = await User.find({ role: "Employee" })
      .select("username email onboardingStatus createdAt")
      .sort({ createdAt: -1 });

    const employeesWithDetails = await Promise.all(
      users.map(async (user) => {
        const application = await OnboardingApplication.findOne({
          userId: user._id,
        }).select(
          "firstName lastName middleName preferredName ssn cellPhone visaTitle usResident status submittedAt reviewedAt visaStartDate visaEndDate",
        );

        const profile = await Profile.findOne({
          user: user._id,
        }).select(
          "firstName lastName middleName preferredName ssn contactInfo visaInformation address emergencyContacts documents visaDocuments",
        );

        // Prefer Profile data, fallback to Application data
        // For name:
        const firstName = profile?.firstName || application?.firstName || "";
        const lastName = profile?.lastName || application?.lastName || "";
        const middleName = profile?.middleName || application?.middleName || "";
        const preferredName =
          profile?.preferredName || application?.preferredName || "";

        // For SSN:
        const ssn = profile?.ssn || application?.ssn || "N/A";

        // For Phone: Profile has cellPhone in contactInfo
        const phone =
          profile?.contactInfo?.cellPhone || application?.cellPhone || "N/A";

        // For Visa Title:
        // Profile has visaInformation.visaType. Application has usResident + visaTitle logic.
        // We should replicate the logic or use the profile's explicit visaType if set.
        let visaTitle = "N/A";
        if (profile?.visaInformation?.visaType) {
          visaTitle = profile.visaInformation.visaType;
        } else if (application) {
          visaTitle =
            (application.usResident === "greenCard"
              ? "Green Card"
              : application.usResident === "usCitizen"
                ? "US Citizen"
                : application.visaTitle) || "N/A";
        }

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName,
          middleName,
          lastName,
          preferredName,
          fullName:
            `${firstName} ${middleName} ${lastName}`
              .replace(/\s+/g, " ")
              .trim() || "N/A", // Reverted: Only show real name or N/A
          ssn,
          phone,
          visaTitle,
          onboardingStatus: normalizeStatusValue(user.onboardingStatus),
          workAuthorizationTitle: (() => {
               const status = normalizeStatusValue(user.onboardingStatus);
               if (status === 'Pending') return 'Onboarding Review Needed';
               if (status === 'Rejected') return 'Onboarding Rejected';
               if (status === 'Not Started' || status === 'Never Submitted') return 'Not Started';
               if (status === 'Approved') {
                   if (visaTitle === 'US Citizen' || visaTitle === 'Green Card') return 'Active (Citizen/GC)';

                   const isF1 = String(visaTitle || '').startsWith('F1');
                   if (isF1) {
                      const visaDocs = profile?.visaDocuments || {};
                      const allApproved =
                        visaDocs?.optReceipt?.status === 'approved' &&
                        visaDocs?.optEad?.status === 'approved' &&
                        visaDocs?.i983?.status === 'approved' &&
                        visaDocs?.i20?.status === 'approved';
                      return allApproved ? 'Active' : 'Visa Status Management';
                   }

                   // Non-F1 work authorization does not require OPT pipeline in this project scope.
                   if (visaTitle && visaTitle !== 'N/A') return 'Active';
                   return 'Active';
               }
               return 'Unknown';
          })(),
          createdAt: user.createdAt,
          application: application
            ? {
                firstName: application.firstName,
                lastName: application.lastName,
                status: normalizeStatusValue(application.status),
                submittedAt: application.submittedAt,
                reviewedAt: application.reviewedAt,
              }
            : null,
        };
      }),
    );

    // Filter by status if provided
    let filteredEmployees = employeesWithDetails;

    const normalizedStatus = normalizeStatusKey(status);

    if (status && normalizedStatus !== "all") {
      if (normalizedStatus === "notstarted") {
        filteredEmployees = employeesWithDetails.filter(
          (emp) =>
            !emp.application ||
            normalizeStatusKey(emp.onboardingStatus) === "neversubmitted",
        );
      } else {
        filteredEmployees = employeesWithDetails.filter(
          (emp) =>
            normalizeStatusKey(emp.onboardingStatus) === normalizedStatus,
        );
      }
    }

    // Filter by search keyword if provided
    if (search && search.trim()) {
      const keyword = search.trim().toLowerCase();
      filteredEmployees = filteredEmployees.filter((emp) => {
        const firstName = (emp.firstName || "").toLowerCase();
        const lastName = (emp.lastName || "").toLowerCase();
        const preferredName = (emp.preferredName || "").toLowerCase();

        return (
          firstName.includes(keyword) ||
          lastName.includes(keyword) ||
          preferredName.includes(keyword)
        );
      });
    }

    // Sort by lastName alphabetically (A-Z)
    filteredEmployees.sort((a, b) => {
      const lastNameA = a.lastName.toLowerCase() || "";
      const lastNameB = b.lastName.toLowerCase() || "";
      return lastNameA.localeCompare(lastNameB);
    });

    res.status(200).json({
      count: filteredEmployees.length,
      employees: filteredEmployees,
    });
  } catch (err) {
    console.error("Get employees error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ============================================
// getVisaStatusList:
// Function: HR list of employees with visa info + OPT document review status
// Route: GET /api/hr/visa-status
// Response: { count: number, employees: array }
// ============================================
export const getVisaStatusList = async (req, res) => {
  try {
    const users = await User.find({ role: "Employee" })
      .select("username email role createdAt")
      .sort({ createdAt: -1 });

    const employees = await Promise.all(
      users.map(async (user) => {
        const profile = await Profile.findOne({ user: user._id }).select(
          "firstName lastName preferredName profile_picture visaInformation documents visaDocuments",
        );

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          profile: profile ? profile.toObject() : null,
        };
      }),
    );

    // Only keep F1 employees (e.g. 'F1(CPT/OPT)')
    const f1Employees = employees.filter((e) => {
      const visaType = e?.profile?.visaInformation?.visaType;
      if (!visaType) return false;
      return visaType === "F1(CPT/OPT)" || String(visaType).startsWith("F1");
    });

    res.status(200).json({ count: f1Employees.length, employees: f1Employees });
  } catch (err) {
    console.error("Get visa status list error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================
// getEmployeeById:
// Function: Get a single employee's application by userId
// Route: GET /api/hr/employees/:id
// Parameters: id - MongoDB ObjectId of the user
// Response: { application: object|null, user: object|null }
// ============================================
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "username email role onboardingStatus",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const application = await OnboardingApplication.findOne({ userId: id });
    const profile = await Profile.findOne({ user: id });

    res.status(200).json({
      application: application
        ? {
            ...application.toObject(),
            status: normalizeStatusValue(application.status),
          }
        : null,
      user: {
        ...user.toObject(),
        onboardingStatus: normalizeStatusValue(user.onboardingStatus),
      },
      profile: profile ? profile.toObject() : null,
    });
  } catch (err) {
    console.error("Get employee detail error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ============================================
// reviewVisaDocument:
// Function: HR approves/rejects a specific OPT document
// Route: PATCH /api/hr/visa-status/:userId/documents/:docType/review
// Body: { status: "approved"|"rejected", feedback?: string }
// ============================================
export const reviewVisaDocument = async (req, res) => {
  try {
    const { userId, docType } = req.params;
    const { status, feedback } = req.body;

    const allowedDocTypes = new Set(["optReceipt", "optEad", "i983", "i20"]);
    if (!allowedDocTypes.has(docType)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Status must be either "approved" or "rejected"' });
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const path = profile?.documents?.[docType];
    if (!path) {
      return res
        .status(400)
        .json({ message: "No uploaded document to review" });
    }

    profile.visaDocuments = profile.visaDocuments || {};
    profile.visaDocuments[docType] = {
      ...(profile.visaDocuments[docType] || {}),
      status,
      feedback: status === "rejected" ? feedback || "" : "",
      reviewedAt: new Date(),
    };

    await profile.save();

    res.status(200).json({
      message: "Visa document reviewed",
      userId,
      docType,
      status,
      profile,
    });
  } catch (err) {
    console.error("Review visa document error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ============================================
// sendVisaStatusReminder:
// Function: Sends an email reminder to employee about next step
// Route: POST /api/hr/visa-status/:userId/notify
// Body: { nextStep: string }
// ============================================
export const sendVisaStatusReminder = async (req, res) => {
  try {
    const { userId } = req.params;
    const { nextStep } = req.body || {};

    const user = await User.findById(userId).select("email username");
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = await Profile.findOne({ user: userId }).select(
      "firstName lastName preferredName",
    );

    const name =
      `${profile?.preferredName || profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
      user.username ||
      "";

    await sendVisaStatusReminderEmail(user.email, name, String(nextStep || ""));

    res.status(200).json({ message: "Notification sent" });
  } catch (err) {
    console.error("Send visa reminder error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default {
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
};
