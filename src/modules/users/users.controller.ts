import { Request, Response } from "express";
import httpStatus from "http-status";
import { usersService } from "./users.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

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
  const user = (req as any).user;

  if (!user) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Unauthorized. Please log in.",
    });
  }

  const profile = await usersService.getMyProfile(user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile fetched successfully",
    data: { profile },
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const payload = req.body;
  const updatedUser = await usersService.updateMyProfile(user.id, payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile updated successfully",
    data: { updatedUser },
  });
});

export const usersController = {
  createUser,
  getMyProfile,
  updateMyProfile,
};
