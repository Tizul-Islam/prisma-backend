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
    data: {user},
  });
});

export const usersController = {
  createUser,
};
