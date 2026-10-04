export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const httpError = (status, message) => Object.assign(new Error(message), { status });

export const notFound = (req, res, next) => next(httpError(404, `Route not found: ${req.originalUrl}`));

export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.code === 11000) {
    status = 400;
    message = 'Email already registered';
  }
  res.status(status).json({ message, ...(process.env.NODE_ENV !== 'production' && status === 500 && { stack: err.stack }) });
};
