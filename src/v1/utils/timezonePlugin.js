const moment = require('moment-timezone');

function timezonePlugin(schema, options) {
    schema.pre('save', function(next) {
        if (this.createdAt) {
            this.createdAt = moment.tz(this.createdAt, 'Asia/Ho_Chi_Minh').toDate();
        }
        if (this.updatedAt) {
            this.updatedAt = moment.tz(this.updatedAt, 'Asia/Ho_Chi_Minh').toDate();
        }
        next();
    });

    schema.pre('findOneAndUpdate', function(next) {
        const update = this.getUpdate();
        if (update.$set && update.$set.createdAt) {
            update.$set.createdAt = moment.tz(update.$set.createdAt, 'Asia/Ho_Chi_Minh').toDate();
        }
        if (update.$set && update.$set.updatedAt) {
            update.$set.updatedAt = moment.tz(update.$set.updatedAt, 'Asia/Ho_Chi_Minh').toDate();
        }
        next();
    });

    schema.pre('update', function(next) {
        const update = this.getUpdate();
        if (update.$set && update.$set.createdAt) {
            update.$set.createdAt = moment.tz(update.$set.createdAt, 'Asia/Ho_Chi_Minh').toDate();
        }
        if (update.$set && update.$set.updatedAt) {
            update.$set.updatedAt = moment.tz(update.$set.updatedAt, 'Asia/Ho_Chi_Minh').toDate();
        }
        next();
    });

    schema.methods.toJSON = function() {
        const obj = this.toObject();
        if (obj.createdAt) {
            obj.createdAt = moment.tz(obj.createdAt, 'Asia/Ho_Chi_Minh').format();
        }
        if (obj.updatedAt) {
            obj.updatedAt = moment.tz(obj.updatedAt, 'Asia/Ho_Chi_Minh').format();
        }
        return obj;
    };
}

module.exports = timezonePlugin;
