/** Operational error carrying an HTTP status code and optional machine-readable code. */
class AppError extends Error {
  constructor(message, statusCode = 500, extra = {}) {
    super(message);
    this.statusCode = statusCode;
    this.extra = extra;
  }
}
module.exports = AppError;
