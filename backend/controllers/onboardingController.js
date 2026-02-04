import OnboardingApplication from "../models/OnboardingApplication.js";
import User from "../models/User.js";

// ============================================
// Submit or Update Onboarding Application
// ============================================
export const submitApplication = async (req, res) => {
    try {
        const userId = req.userId; // from verifyToken middleware
        const applicationData = req.body;

        // handle the path for uploaded files
        if (req.files) {
            applicationData.documents = applicationData.documents || {};
            
            if (req.files.driverLicense) {
                applicationData.documents.driverLicense = req.files.driverLicense[0].path;
            }

            if (req.files.workAuthorization) {
                applicationData.documents.workAuthorization = req.files.workAuthorization[0].path;
            }

            if (req.files.other) {
                applicationData.documents.other = req.files.other[0].path;
            }
        }

        // check if there is an application
        let application = await OnboardingApplication.findOne({ userId });

        if (application) {
            // update current application
            Object.assign(application, applicationData);
            application.status = 'Pending';
            application.submittedAt = new Date();
        } else {
            // create new application
            application = new OnboardingApplication({
                userId,
                ...applicationData,
                status: 'Pending',
                submittedAt: new Date()
            });
        }

        await application.save();

        // update user onboarding Status
        await User.findByIdAndUpdate(userId, {
            onboardingStatus: 'Pending'
        });

        res.status(200).json({
            message: 'Onboarding application submitted successfully',
            application: application
        });

    } catch (err) {
        console.error('Submite application error:', err);
        res.status(500).json({
            message: 'Server Error',
            error: err.message
        });
    }
};

// ============================================
// Get Current User's Application
// ============================================
export const getMyApplication = async (req, res) => {
    try {
        const userId = req.userId;

        const application = await OnboardingApplication.findOne({ userId })
            .select('+ssn'); // Includes SSN (for users to view their own information)

        if (!application) {
            return res.status(404).json({
                message: 'No application found'
            });
        }

        res.status(200).json({
            application: application
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
// Get Application Status
// ============================================
export const getApplicationStatus = async (req, res) => {
    try {
        const userId = req.userId;

        const application = await OnboardingApplication.findOne({ userId })
            .select('status feedback submittedAt reviewedAt');

        if (!application) {
            return res.status(200).json({
                status: 'Never Submitted'
            });
        }

        res.status(200).json({
            status: application.status,
            feedback: application.feedback,
            submittedAt: application.submittedAt,
            reviewedAt: application.reviewedAt
        });

    } catch (err) {
        console.log('Get status error:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};