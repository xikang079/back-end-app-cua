const { Schema, model } = require('mongoose');

const COLLECTION_NAME = 'DailySummaries';
const DocumentName = 'DailySummary';

const summaryDetailSchema = new Schema({
    crabType: { type: Schema.Types.ObjectId, ref: 'CrabType', required: true },
    totalWeight: { type: Number, required: true },
    totalCost: { type: Number, required: true },
}, { _id: false });

const dailySummarySchema = new Schema({
    depot: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    details: [summaryDetailSchema],
    totalAmount: { type: Number, required: true },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

dailySummarySchema.index({ depot: 1, createdAt: 1 });

module.exports = model(DocumentName, dailySummarySchema);
