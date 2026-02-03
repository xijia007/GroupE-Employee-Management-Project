import mongoose from "mongoose";

const onboardingApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Personal Information
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    middleName: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true
    },
    ssn: {
        type: String,
        required: true,
        select: false // Sensitive information, not returned in default queries.
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'I do not wish to answer'],
        required: true
    },

    // Current Address
    currentAddress: {
        building: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        }
    },

    // Contact Information
    cellPhone: {
        type: String,
        required: true
    },
    workPhone: {
        type: String,
        default: ''
    },

    // Employment
    visaTitle: {
        type: String,
        enum: ['H1-B', 'L2', 'F1(CPT/OPT)', 'H4', 'Other'],
        required: true
    },
    visaStartDate: {
        type: Date,
        required: function() {
            return this.visaTitle !== 'Other';
        }
    },
    visaEndDate: {
        type: Date,
        required: function() {
            return this.visaTitle !== 'Other';
        }
    },

    // Emergency Contacts
    emergencyContacts: [{
         firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        middleName: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        relationship: {
            type: String,
            required: true
        }
    }],

    // Documents
    documents: {
        driverLicense: {
            type: String,
            default: ''
        },
        workAuthorization: {
            type: String,
            default: ''
        },
        other: {
            type: String,
            default: ''
        }
    },

    // Application Status
    status: {
        type: String,
        enum: ['Never Submitted', 'Pending', 'Approved', 'Rejected'],
        default:'Never Submitted' 
    },

    // HR Feedback
    feedback: {
        type: String,
        default: ''
    },

    // submit time
    submittedAt: {
        type: Date
    },

    // HR review time
    reviewedAt: {
        type: Date
    },

    // HR review person
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

}, {
    timestamps: true,
    collection: 'OnboardingApplication'
});

onboardingApplicationSchema.index({ userId: 1 });
onboardingApplicationSchema.index({ status: 1 });

export default mongoose.model('OnboardingApplication', onboardingApplicationSchema);