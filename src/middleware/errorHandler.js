const { HTTP_STATUS } = require('../config/constants');

function errorHandler(error, req, res, next) {
    console.error('❌ Unhandled Error:', error);

    // Default error response
    let statusCode = HTTP_STATUS.INTERNAL_ERROR;
    let message = 'Internal server error';
    let details = error.message;

    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Validation error';
    } else if (error.name === 'CastError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Invalid ID format';
    } else if (error.code === '23505') { // PostgreSQL unique violation
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Resource already exists';
    } else if (error.code === '23503') { // PostgreSQL foreign key violation
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Invalid reference';
    }

    res.status(statusCode).json({
        error: message,
        details: details,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    });
}

function notFoundHandler(req, res) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        error: 'Route not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};