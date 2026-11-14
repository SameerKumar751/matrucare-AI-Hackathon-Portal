const AppError = require('../utils/AppError');

exports.notFound = (req, res, next) => next(new AppError('Route not found', 404));

// Only these extra keys may ever be sent to clients (prevents leaking internals).
const SAFE_EXTRA = ['code', 'errors', 'retryAfter', 'email'];

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message;
  if (err.code === 11000) { status = 409; message = 'Duplicate entry already exists'; }
  else if (err.name === 'ValidationError') { status = 400; message = 'Validation failed'; }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid identifier'; }
  else if (err.type === 'entity.parse.failed') { status = 400; message = 'Malformed JSON body'; }
  else if (err.type === 'entity.too.large') { status = 413; message = 'Request body too large'; }
  else if (!(err instanceof AppError)) {
    // Unknown error: log details server-side only, send a generic message
    console.error('[error]', err);
    status = 500; message = 'Internal server error';
  }
  const body = { success: false, message };
  SAFE_EXTRA.forEach((k) => { if (err.extra && err.extra[k] !== undefined) body[k] = err.extra[k]; });
  res.status(status).json(body);
};
