const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthdate: { type: Date, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);
