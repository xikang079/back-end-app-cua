const {Schema , model} = require('mongoose');

const DocumentName = 'KeyToken';
const COLLECTION_NAME = 'KeyTokens';

const keyTokenSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
    },
    publicKey: {
        type: String,
        required: true,
    },
    privateKey: {
        type: String,
        required: true,
    },
    refeshToken: {
        type: String,
        required: true,
    },

}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

module.exports = model(DocumentName, keyTokenSchema);