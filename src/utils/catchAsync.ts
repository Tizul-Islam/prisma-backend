import { Request, Response, RequestHandler, NextFunction } from "express";
import httpStatus from "http-status";




export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next as any);
    } catch (error) {
      next(error);
    }
  };
};
