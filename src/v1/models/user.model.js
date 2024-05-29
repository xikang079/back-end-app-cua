const { Schema, model } = require('mongoose');

const COLLECTION_NAME = 'Users';
const DocumentName = 'User';

const userSchema = new Schema({
    fullname: {
        type: String,
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
        required: [true, 'Role is required'],
    },
    status: {
        type: Boolean,
        default: true,
    },
    depotName: {
        type: String,
        required: [true, 'Depot name is required'],
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

userSchema.index({ username: 1, depotName: 1 });

module.exports = model(DocumentName, userSchema);
