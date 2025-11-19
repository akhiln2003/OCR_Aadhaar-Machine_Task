export type ErrorDetails = Record<string, unknown> | string | string[];

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: ErrorDetails;

  constructor({
    message,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    details,
  }: {
    message: string;
    statusCode?: number;
    code?: string;
    details?: ErrorDetails;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}