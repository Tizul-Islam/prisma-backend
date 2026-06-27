import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";






const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const {accessToken, refreshToken} = await authService.loginUser(payload);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });


  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 , // 1 days
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: {accessToken, refreshToken},
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


  const refreshToken = req.cookies.refreshToken; 

  const {accessToken, refreshToken : newRefreshToken} = await authService.refreshToken(refreshToken); 
 
res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 , // 1 days
  });

sendResponse(res,{
  success:true,
  message:"Token refresh successfully",
  statusCode:httpStatus.OK,
  data:{accessToken}
})

});

export const authController = {
  loginUser,
  refreshToken,
};

