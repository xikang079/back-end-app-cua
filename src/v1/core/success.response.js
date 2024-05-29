const StatusCode = require('./error.statuscode');
const Reason = require('./error.reason');

class SuccessResponse {
    constructor({
        message,
        metadata,
        statusCode,
        statusMessage
    }) {
        this.message = message;
        this.metadata = metadata;
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }

    sendData (res){
        return res.status(this.statusCode).json(this)
    }
}

class CREATED extends SuccessResponse {
    constructor(message, metadata, statusCode = StatusCode.CREATED, statusMessage = Reason.CREATED) {
        super({
            message,
            metadata,
            statusCode,
            statusMessage
        });
    }
}

class OK extends SuccessResponse {
    constructor(message, metadata, statusCode = StatusCode.OK, statusMessage = Reason.OK) {
        super({
            message,
            metadata,
            statusCode,
            statusMessage
        });
    }
}

module.exports = {
    CREATED,
    OK,
}