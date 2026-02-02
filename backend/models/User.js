import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['Employee', 'HR'],
        default: 'Employee'
    },
    onboardingStatus: {
        type: String,
        enum: ['Never Submitted', 'Pending', 'Approved', 'Rejected'],
        default: 'Never Submitted'
    }
}, {
    timestamps: true,
    collection: 'User'  // Specify exact collection name
});

export default mongoose.model('User', userSchema);