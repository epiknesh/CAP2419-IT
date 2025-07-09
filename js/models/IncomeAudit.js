const mongoose = require('mongoose');

const IncomeAuditSchema = new mongoose.Schema({
    busID: { type: Number, required: true },
    cashierID: { type: Number, required: true },
    incomeToday: { type: Number, required: true },
}, {
    timestamps: true, // adds createdAt and updatedAt
    collection: 'income_audit'
});

module.exports = mongoose.model('IncomeAudit', IncomeAuditSchema, 'income_audit');