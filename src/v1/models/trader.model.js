const { Schema, model } = require('mongoose');

const COLLECTION_NAME = 'Traders';
const DocumentName = 'Trader';

const traderSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Trader name is required'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Contact information is required'],
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

traderSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = model(DocumentName, traderSchema);
