const express = require('express');
const app = express();
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
const { handleErrorsValidationMongoose } = require('./v1/middlewares/index');
const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf } = format;
require('winston-daily-rotate-file');
const { Writable } = require('stream');
const axios = require('axios');

const { createServer } = require('node:http');
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
        // Remove special characters that might break Markdown parsing
        const cleanMessage = message.replace(/[\[\]\(\)_*`]/g, '');
        if (cleanMessage.length > 4096) { // Telegram message length limit
            console.warn('Message too long, skipping Telegram notification.');
            return callback(); // Skip sending message
        }
        axios.post(TELEGRAM_API_URL, {
            chat_id: TELEGRAM_CHAT_ID,
            text: cleanMessage,
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
    let userInfo = '';
    if (req.user) {
        console.log('req.user:', req.user); // Log the req.user object
        const { id, username, depotName } = req.user;
        userInfo = `User ID: ${id}, Username: ${username || 'N/A'}, Tên vựa: ${depotName || 'N/A'}`;
    } else {
        userInfo = 'Người dùng chưa xác thực';
    }
    const errorMessage = `Lỗi ${error.status || 500}: ${error.message}. ${userInfo}`;
    logger.error(errorMessage);
    res.status(error.status || 500).send({
        error: {
            status: error.status || 500,
            message: error.message || 'Lỗi máy chủ nội bộ',
        },
    });
});


module.exports = {
    app,
    server
};
