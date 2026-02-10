export class AppError extends Error {
  status;

  constructor(status, message) {
    super(message);
    this.status = status;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}
