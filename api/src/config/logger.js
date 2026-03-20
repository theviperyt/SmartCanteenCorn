const winston = require("winston");
const path = require("path");

// keep your main timestamp + errors formatter for console/combined
const baseTimestamp = winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });

const logFormat = winston.format.combine(
    baseTimestamp,
    winston.format.errors({ stack: true }), // allow stack to exist in info object
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}] : ${message} ${stack || ''}`;
    })
);

// a special format for error.log that removes stack before printing
const errorFileFormat = winston.format.combine(
    baseTimestamp,
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return stack
            ? `${timestamp} [${level.toUpperCase()}] : ${message}\n${stack}`
            : `${timestamp} [${level.toUpperCase()}] : ${message}`;
    })
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat, // default format for transports that don't override it
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            format: errorFileFormat // <- only message (no stack) goes into error.log
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            // uses default logger.format (logFormat) which includes stack
        }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            logFormat // console still shows stack
        ),
    }));
}

module.exports = logger;