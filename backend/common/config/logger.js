const winston = require("winston");
const path = require("path");

const logDir = "logs";

// Define log formats
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ""
    }`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "project-management-api" },
  transports: [
    // Write to console
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Write to file - errors
    // new winston.transports.File({
    //   filename: path.join(logDir, "error.log"),
    //   level: "error",
    // }),
    // // Write to file - all logs
    // new winston.transports.File({
    //   filename: path.join(logDir, "combined.log"),
    // }),
  ],
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
