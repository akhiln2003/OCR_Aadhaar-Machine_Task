import { ErrorRequestHandler } from "express";
import { ApiError } from "../errors/ApiError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode =
    err instanceof ApiError ? err.statusCode : err.statusCode ?? 500;

  const response = {
    success: false,
    error: {
      code: err instanceof ApiError ? err.code : err.code ?? "INTERNAL_SERVER_ERROR",
      message:
        err instanceof ApiError
          ? err.message
          : statusCode === 500
          ? "Something went wrong. Please try again later."
          : err.message ?? "Unexpected error",
      details: err instanceof ApiError ? err.details : undefined,
    },
  };

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
    (response.error as typeof response.error & { stack?: string }).stack = err.stack;
  }

  res.status(statusCode).json(response);
};