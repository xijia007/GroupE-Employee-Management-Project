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
import { sendRegistrationEmail, sendApplicationStatusEmail } from "../utils/emailService.js";
import bcrypt from 'bcryptjs';
import app from "../server.js";

// ============================================
// generateToken:
// Function: Generates a registration token and sends an email.
// Route: POST /api/hr/generate-token
// Request Body: { email: string, name: string }
// Response: { message: string, token: object }
// ============================================
export const generateToken = async (req, res) => {
    try {
        // Extract data from the request body
        const { email, name } = req.body;

        // Validate required fields
        // If any required fields are missing, return 400 Bad Request
        if (!email || !name) {
            return res.status(400).json({
                message: 'Email and name are required.'
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
            status: { $in: ['Sent', 'Pending'] }, // $in: MongoDB operator, matches elements within an array.
            expiresAt: { $gt: new Date() } // $gt: greater than, greater than the current time
        });

        if (existingToken) {
            return res.status(400).json({
                message: 'A valid registration token already exists for this email.'
            });
        }

        // Generate a random token
        // crypto.randomBytes(32): Generates 32 bytes of random data
        // .toString('hex'): Converts to a hexadecimal string (64 characters)
        // Example output: 'a3f7c9d2e8b1...' (64-bit)
        const token = crypto.randomBytes(32).toString('hex');

        // Set the expiration time (3 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 3); // Current date + 3 days

        // Create and save the token record.
        const registrationToken = new RegistrationToken({
            token,  // Generated token
            email,  // Recipient's email address
            name,   // Recipient's name
            status: 'Sent', // Status: Sent
            expiresAt
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
                message: 'Registration token generated and email sent successfully',
                token: {
                    email,
                    name,
                    expiresAt
                }
            });
        } catch (emailError) {
            // Email sending failed, but the token has been generated.
            console.error('Email sending failed:', emailError);
            res.status(201).json({
                message: 'Token generated but email failed to send',
                token: {
                    email,
                    name,
                    expiresAt
                },
                emailError: emailError.message // Returns error information for debugging.
            });
        }
    } catch (err) {
        // Global error handling
        console.error('Generate token error:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
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
        const tokens = await RegistrationToken.find().select('-token').sort({ createAt: -1 });

        res.status(200).json({
            count: tokens.length,
            tokens
        });
    } catch (err) {
        console.error('Get tokens error:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
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
        if (status && status !== 'All') {
            query.status = status;
        }

        // Querying the application list
        // .select('-ssn -documents'): Do not return sensitive information
        // .sort({ submittedAt: -1 }): Sort in descending order by submission time
        const applications = await OnboardingApplication
            .find(query)
            .select('-ssn -documents')
            .sort({ submittedAt: -1});

        // Add user information to each application
        // Note: OnboardingApplication only contains userId
        // The username and email need to be retrieved from the User table.
        const applicationWithUser = await Promise.all(
            applications.map(async (app) => {
                const user = await User.findById(app.userId).select('username email');

                return {
                    ...app.toObject(), // Convert Mongoose document to a plain object
                    user // Add user information
                };
            })
        );

        res.status(200).json({
            count: applicationWithUser.length,
            applications: applicationWithUser
        });

    } catch (err) {
        console.error('Get applications error:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
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
                message: 'Application not found'
            });
        }

        // Retrieve the corresponding user information.
        const user = await User.findById(application.userId).select('username email role');

        // Return complete information (including sensitive fields)
        // Note: This is the details page; HR needs to see all the information.
        res.status(200).json({
            application,
            user
        });

    } catch (err) {
        console.error('Get application error:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
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
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be either "Approved" or "Rejected"'
            });
        }

        // Search for applications
        const application = await OnboardingApplication.findById(id);

        if (!application) {
            return res.status(404).json({
                message: 'Application not found'
            });
        }

        // Update application status
        application.status = status; // 'Approved' or 'Rejected'
        application.feedback = feedback || ''; // HR feedback(optional)
        application.reviewedAt = new Date(); // Review time
        application.reviewedBy = hrUserId; // Reviewer (HR's userId)

        await application.save(); // Save changes

        // Synchronously update the user's onboardingStatus
        // Purpose: To allow users to quickly retrieve their status upon login.
        await User.findByIdAndUpdate(application.userId, {
            onboardingStatus: status
        });

        // Sending status notification email
        // Note: The review is considered complete even if the email fails to send.
        try {
            await sendApplicationStatusEmail(
                application.email, // Recipient's email address
                application.firstName, // Recipient's email firstName
                status, // 'Approved' or 'Rejected'
                feedback
            );

        } catch (emailError) {
            console.error('Status email failed:', emailError); // This does not affect the main process; execution continues.
        }

        // Return a successful response.
        res.status(200).json({
            message: `Application ${status.toLowerCase()} successfully`,
            application
        });

    } catch (err) {
        console.error('Review application error:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};

export default {
    generateToken,
    getAllTokens,
    getAllApplications,
    getApplicationById,
    reviewApplication
}