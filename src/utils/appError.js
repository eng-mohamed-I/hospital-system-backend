class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.stausCode = statusCode;
    this.operational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
