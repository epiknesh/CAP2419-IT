const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    busID: { type: Number, required: true, unique: true },
    plateNumber: { type: String, required: true, unique: true },
    driverID: { type: Number, required: true },
    controllerID: { type: Number, required: true }
}, { timestamps: true, collection: 'buses' });

module.exports = mongoose.model('Bus', BusSchema, 'buses');
