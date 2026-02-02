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
    createAt: {
        type: Date,
        default: Date.now,
        expires: 259200 // expired in 3 days
    }
});

export default RegistrationToken;