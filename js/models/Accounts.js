const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    accountID: { type: Number, unique: true },  // Auto-incrementing account ID
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthdate: { type: Date, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    profilePicture: { type: String },
    createdAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Accounts', AccountSchema);
