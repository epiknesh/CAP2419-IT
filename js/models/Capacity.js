const mongoose = require('mongoose');

const CapacitySchema = new mongoose.Schema({
    date: { type: Date, required: true, default: Date.now },
    capacity: { type: Number, required: true },
    busID: { type: Number, required: true }
}, { timestamps: true, collection: 'capacity' });

module.exports = mongoose.model('Capacity', CapacitySchema, 'capacity');
