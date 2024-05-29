const { Schema, model } = require('mongoose');

const COLLECTION_NAME = 'ExportInvoices';
const DocumentName = 'ExportInvoice';

const exportInvoiceSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    boxes: [{
        boxNumber: { type: Number, required: true },
        crabs: [{
            crabType: { type: Schema.Types.ObjectId, ref: 'CrabType', required: true },
            weight: { type: Number, required: true }
        }],
        totalWeight: { type: Number, required: true }
    }],
    totalBoxes: {
        type: Number,
        required: [true, 'Total boxes is required'],
    },
    totalWeight: {
        type: Number,
        required: [true, 'Total weight is required'],
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

exportInvoiceSchema.index({ date: 1, user: 1 });

module.exports = model(DocumentName, exportInvoiceSchema);
