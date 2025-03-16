const mongoose = require('mongoose');

const BusAccountSchema = new mongoose.Schema({
    accountID: { type: Number, unique: true },  // Auto-incrementing account ID
    profile_picture: { type: String },  // URL to the profile picture
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true, match: /^09[0-9]{9}$/ },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('BusAccounts', BusAccountSchema);
