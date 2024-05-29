"user strict"

const ErrorStatusCode = require('./error.statuscode');
const ErrorReason = require('./error.reason');

class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.status = statusCode;
    }
}

class AuthError extends ErrorResponse {
    constructor(message = ErrorReason.UNAUTHORIZED, statusCode = ErrorStatusCode.UNAUTHORIZED) {
        super(message, statusCode);
    }
}

class NotFoundError extends ErrorResponse {
    constructor(message = ErrorReason.NotFoundError, statusCode = ErrorStatusCode.NOT_FOUND) {
        super(message, statusCode);
    }
}

module.exports = {
    AuthError,
    NotFoundError,
}