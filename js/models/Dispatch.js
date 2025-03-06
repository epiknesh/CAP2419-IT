const mongoose = require('mongoose');

const DispatchSchema = new mongoose.Schema({
    busID: { type: Number, required: true, unique: true },
    status: { type: Number, required: true }, // 1 = Active, 2 = Inactive (Define as needed)
    lastDispatch: { type: Date, required: true }, // New field for last dispatch
    nextDispatch: { type: Date, required: true },
    coordinates: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
}, { timestamps: true });

DispatchSchema.index({ coordinates: '2dsphere' }, { collection: 'dispatch' }); // Enables geospatial queries

module.exports = mongoose.model('Dispatch', DispatchSchema, 'dispatch');
