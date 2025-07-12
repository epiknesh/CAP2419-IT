const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    busID: { type: Number, required: true },
    status: { type: Number, required: true },
    issue: { type: String, required: true },
    schedule: { type: Date, default: null }, // Allow null values
    assignedStaff: { type: String, default: null },
    contactNumber: { type: String, default: null },
    vehicle_condition: { type: Number, required: true },
    image: { type: String, default: null }
}, { collection: 'maintenance' });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
