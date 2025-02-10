const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    busID: Number,
    status: Number,
    issue: String
}, { collection: 'maintenance' }); // <-- Explicitly set the collection name

module.exports = mongoose.model('Maintenance', maintenanceSchema);
