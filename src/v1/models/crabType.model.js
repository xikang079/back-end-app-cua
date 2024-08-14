const { Schema, model } = require('mongoose');

const COLLECTION_NAME = 'CrabTypes';
const DocumentName = 'CrabType';

const crabTypeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Crab type name is required'],
        trim: true,
    },
    pricePerKg: {
        type: Number,
        required: [true, 'Price per kg is required'],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    },
    sortOrder: {
        type: Number,
        default: 0, 
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

// Đặt chỉ mục unique trên cặp trường name và user
crabTypeSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = model(DocumentName, crabTypeSchema);
