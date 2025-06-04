const mongoose = require('mongoose');

const CapacityHistorySchema = new mongoose.Schema({
    busID: { type: Number, required: true },
    date: { type: Date, required: true }, // the day of the log
    hour: { type: Number, required: true, min: 5, max: 22 }, // 5 to 22 (5 AM to 10 PM)
    capacity: { type: Number, required: true }, // capacity at this hour
}, { timestamps: true, collection: 'capacityhistory' });

module.exports = mongoose.model('CapacityHistory', CapacityHistorySchema);
