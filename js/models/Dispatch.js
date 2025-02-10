const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    busID: { type: Number, required: true, unique: true },
    status: { type: Number, required: true }, // 1 = Active, 2 = Inactive (Define as needed)
    nextDispatch: { type: Date, required: true },
    coordinates: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    }
}, { timestamps: true });

BusSchema.index({ coordinates: '2dsphere' }); // Enables geospatial queries

module.exports = mongoose.model('Bus', BusSchema);
