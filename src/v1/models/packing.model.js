const { Schema, model } = require('mongoose');

const COLLECTION_NAME = 'Packings';
const DocumentName = 'Packing';

const crabDetailSchema = new Schema({
    crabType: {
        type: Schema.Types.ObjectId,
        ref: 'CrabType',
        required: true,
    },
    weight: {
        type: Number,
        required: [true, 'Weight is required'],
    }
}, { _id : false });

const packingSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    boxNumber: {
        type: Number,
        required: [true, 'Box number is required']
    },
    crabs: [crabDetailSchema],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    totalWeight: {
        type: Number,
        required: [true, 'Total weight is required']
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

packingSchema.index({ date: 1, boxNumber: 1, user: 1 });

module.exports = model(DocumentName, packingSchema);
