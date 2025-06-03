const mongoose = require('mongoose');

const maintenanceHistorySchema = new mongoose.Schema({
    busID: { type: Number, required: true },
    status: { type: Number, required: true },
    issue: { type: String, required: true },
    schedule: { type: Date, default: null },
    assignedStaff: { type: String, default: null },
    contactNumber: { type: String, default: null },
    vehicle_condition: { type: Number, required: true },
    dateFixed: { type: Date, required: true } // New field for maintenance history
}, { collection: 'maintenancehistory' });

module.exports = mongoose.model('MaintenanceHistory', maintenanceHistorySchema);
