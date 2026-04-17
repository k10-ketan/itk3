'use strict';

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  console.error('[Error]', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
      data: null,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}.`,
      data: null,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format.',
      data: null,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
    data: null,
  });
};

module.exports = { errorMiddleware };
