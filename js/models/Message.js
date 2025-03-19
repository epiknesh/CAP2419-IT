const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, // Sender's name
    profilePic: { type: String, required: true }, // Profile picture URL
    message: { type: String, default: null }, // Text message (optional)
    voiceMessage: { type: String, default: null }, // Voice message URL (optional)
    timestamp: { type: Date, default: Date.now } // Message timestamp
});

// Ensure message OR voiceMessage is present (Not empty messages)
MessageSchema.pre('save', function (next) {
    if (!this.message && !this.voiceMessage) {
        return next(new Error('Message must contain either text or a voice message.'));
    }
    next();
});

module.exports = mongoose.model('Message', MessageSchema);
