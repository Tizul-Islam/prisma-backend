import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: "API Not Found",
    error: {
      path: req.originalUrl,
      message: `The requested path ${req.originalUrl} was not found on this server.`,
    },
  });
};
