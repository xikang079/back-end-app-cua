const express = require('express');
const app = express();
const helmet = require('helmet');
const compression = require('compression');
const { mongo, default: mongoose } = require('mongoose');
require('dotenv').config();
const { handleErrorsValidationMongoose } = require('./v1/middlewares/index');
const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf } = format;
require('winston-daily-rotate-file');
const { Writable } = require('stream');
const axios = require('axios');

const { createServer } = require('node:http');
const { join } = require('node:path');
const server = createServer(app);

require('./v1/databases/init.mongodb');

// Set up security middleware
app.use(helmet());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Định dạng custom cho log message
const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Transport cho file log
const fileTransport = new winston.transports.DailyRotateFile({
    filename: './logs/application-%DATE%.log',
    datePattern: 'DD_MM_YYYY',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
    format: combine(
        timestamp(),
        myFormat,
        winston.format.json()
    )
});

// Custom stream để gửi tin nhắn đến Telegram
const telegramLogStream = new Writable({
    write: function(chunk, encoding, callback) {
        const message = chunk.toString(); 
        axios.post(TELEGRAM_API_URL, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        })
        .then(response => {
            console.log("Message sent to Telegram");
            callback();
        })
        .catch(error => {
            console.error("Failed to send message to Telegram:", error);
            callback(error);
        });
    }
});

const telegramTransport = new winston.transports.Stream({
    level: 'error',
    stream: telegramLogStream,
    format: combine(
        timestamp(),
        myFormat
    )
});

var logger = winston.createLogger({
    transports: [
        fileTransport,
        telegramTransport
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    }
};

app.use(require("morgan")("combined", { "stream": logger.stream }));

// Compress responses
app.use(compression());

// Parse JSON and url-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up routers
app.use(require('./v1/routes/index.router'));

// Error handling for Mongoose validation
app.use(handleErrorsValidationMongoose);

// General error handler
app.use((error, req, res, next) => {
    logger.error(`Error ${error.status || 500}: ${error.message}`);
    res.status(error.status || 500).send({
        error: {
            status: error.status || 500,
            message: error.message || 'Internal Server Error',
        },
    });
});

module.exports = {
    app,
    server
};
