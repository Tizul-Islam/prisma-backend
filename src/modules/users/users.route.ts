import { Router, Request, Response, NextFunction } from "express";
import { usersController } from "./users.controller";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", usersController.createUser);

router.get(
  "/me",
  (req: Request, res: Response, next: NextFunction) => {
    console.log(req.cookies);
    const { accessToken } = req.cookies;
    console.log(accessToken);

    const verifiedToken = jwtUtils.verifyToken(
      accessToken,
      config.jwt_access_secret,
    );

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    const { email, name, id, role } = verifiedToken.data as JwtPayload;

    const requiredRoles = [Role.ADMIN, Role.USER, Role.AUTHOR];

    if (!requiredRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        statusCode: httpStatus.FORBIDDEN,
        message:
          "Forbidden. You don't have permission to access this resource.",
      });
    }

    req.user = {
      email,
      name,
      id,
      role,
    };
    next();
  },
  usersController.getMyProfile,
);

export const userRouter = router;
