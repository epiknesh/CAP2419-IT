const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
    busID: { type: Number, required: true, unique: true },
    incomeToday: { type: Number, required: true, default: 0 },
    incomeWeek: { type: Number, required: true, default: 0 },
    incomeMonth: { type: Number, required: true, default: 0 },
    totalIncome: { type: Number, required: true, default: 0 }
}, { timestamps: true },{ collection: 'income' });

module.exports = mongoose.model('Income', IncomeSchema, 'income');