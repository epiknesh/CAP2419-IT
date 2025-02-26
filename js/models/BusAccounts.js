const mongoose = require('mongoose');

const BusAccountSchema = new mongoose.Schema({
    accountID: { type: Number, unique: true },  // Auto-incrementing account ID
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true, match: /^09[0-9]{9}$/ },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    profilePicture: { type: String, required: true },  // Store the image URL/path
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('BusAccounts', BusAccountSchema);
