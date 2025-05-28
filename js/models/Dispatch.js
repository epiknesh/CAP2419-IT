const mongoose = require('mongoose');

const DispatchSchema = new mongoose.Schema({
    busID: { type: Number, required: true, unique: true },
    status: { type: Number, required: true },
    lastDispatch: { type: Date, required: true },
    nextDispatch: { type: Date, required: true },
    direction: { 
        type: Number, 
        enum: [1, 2], // 1 = southbound, 2 = northbound
        required: true 
    },
    coordinates: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
}, { timestamps: true });


DispatchSchema.index({ coordinates: '2dsphere' }, { collection: 'dispatch' }); // Enables geospatial queries

module.exports = mongoose.model('Dispatch', DispatchSchema, 'dispatch');
