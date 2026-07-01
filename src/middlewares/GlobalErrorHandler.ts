import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { sendResponse } from "../utils/sendResponse";
import { Prisma } from "../generated/prisma/client";

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong.";

  // Handle Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2000":
        statusCode = httpStatus.BAD_REQUEST;
        message = "The provided value is too long for the column's type.";
        break;
      case "P2001":
        statusCode = httpStatus.NOT_FOUND;
        message = "The record searched for does not exist.";
        break;
      case "P2002":
        statusCode = httpStatus.CONFLICT;
        const targetFields = (err.meta?.target as string[]) || [];
        message = `Unique constraint failed on the field(s): ${targetFields.join(", ")}`;
        break;
      case "P2003":
        statusCode = httpStatus.BAD_REQUEST;
        message = `Foreign key constraint failed on field: ${err.meta?.field_name || "unknown"}`;
        break;
      case "P2025":
        statusCode = httpStatus.NOT_FOUND;
        message = (err.meta?.cause as string) || "An operation failed because a required record was not found.";
        break;
      default:
        statusCode = httpStatus.BAD_REQUEST;
        message = err.message || "A database request error occurred.";
        break;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Prisma validation error. Please check request payload types and fields.";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Database initialization error. Connection could not be established.";
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "An unknown database request error occurred.";
  } else {
    // Handle standard application errors
    const errMessage = String(message);

    if (
      errMessage.includes("not logged in") ||
      errMessage.includes("jwt") ||
      errMessage.includes("token") ||
      errMessage.includes("credentials")
    ) {
      statusCode = httpStatus.UNAUTHORIZED;
    } else if (
      errMessage.includes("Forbidden") ||
      errMessage.includes("blocked") ||
      errMessage.includes("permission") ||
      errMessage.includes("owner")
    ) {
      statusCode = httpStatus.FORBIDDEN;
    } else if (errMessage.includes("not found")) {
      statusCode = httpStatus.NOT_FOUND;
    } else if (errMessage.includes("already exists")) {
      statusCode = httpStatus.CONFLICT;
    }
  }

  // Only log internal server errors (500) to keep terminal logs clean
  if (statusCode === httpStatus.INTERNAL_SERVER_ERROR) {
    console.error("Internal Server Error Details:", err);
  }

  sendResponse(res, {
    success: false,
    statusCode,
    message,
  });
};
