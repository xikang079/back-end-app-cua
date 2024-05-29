const { Schema, model } = require('mongoose');

const COLLECTION_NAME = 'CrabPurchases';
const DocumentName = 'CrabPurchase';

const crabDetailSchema = new Schema({
    crabType: {
        type: Schema.Types.ObjectId,
        ref: 'CrabType',
        required: true,
    },
    weight: {
        type: Number,
        required: [true, 'Weight is required'],
    },
    pricePerKg: {
        type: Number,
        required: true,
    },
    totalCost: {
        type: Number,
        required: true,
    }
}, { _id: false });

const crabPurchaseSchema = new Schema({
    trader: {
        type: Schema.Types.ObjectId,
        ref: 'Trader',
        required: true,
    },
    crabs: [crabDetailSchema],
    totalCost: {
        type: Number,
        required: [true, 'Total cost is required'],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

crabPurchaseSchema.index({ trader: 1, user: 1 });

module.exports = model(DocumentName, crabPurchaseSchema);