const mongoose = require('mongoose');

const FuelSchema = new mongoose.Schema({
    busId: { type: Number, required: true, unique: true },
    lastRefuelDate: { type: Date, required: true }, // Date of last full tank
    currentFuel: { type: Number, required: true }, // Current fuel level (in liters)
    fuelRefilled: { type: Number, required: true } // Current fuel level (in liters)
}, { timestamps: true, collection: 'fuel' });

module.exports = mongoose.model('Fuel', FuelSchema, 'fuel');