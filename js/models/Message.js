const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    profilePic: { type: String, required: true },
    message: { type: String, default: null },
    voiceMessage: { type: String, default: null },
    channel: { type: String, required: true }, // NEW: Channel name or ID
    timestamp: { type: Date, default: Date.now }
});

// Ensure message OR voiceMessage is present (Not empty messages)
MessageSchema.pre('save', function (next) {
    if (!this.message && !this.voiceMessage) {
        return next(new Error('Message must contain either text or a voice message.'));
    }
    next();
});

module.exports = mongoose.model('Message', MessageSchema);
