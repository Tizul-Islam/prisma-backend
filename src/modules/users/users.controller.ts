import { Request, Response } from "express";
import httpStatus from "http-status";
import { usersService } from "./users.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = await usersService.registerUser(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User created successfully",
    data: { user },
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Access token missing",
    });
  }

  const verifiedToken = jwtUtils.verifyToken(
    accessToken,
    config.jwt_access_secret,
  );

  if (typeof verifiedToken === "string") {
    throw new Error(verifiedToken);
  }

  const profile = await usersService.getMyProfile(
    (verifiedToken as any).id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile fetched successfully",
    data: { profile },
  });
});

export const usersController = {
  createUser,
  getMyProfile,
};
