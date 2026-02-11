import mongoose from "mongoose";

const registrationTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Sent', 'Submitted'],
        default: 'Sent'
    }, // Sent is the invitation is sent, and Submitted is the onboard application is submitted 
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true,
    collection: 'RegistrationToken'  // Specify exact collection name
});

export default mongoose.model('RegistrationToken', registrationTokenSchema);
