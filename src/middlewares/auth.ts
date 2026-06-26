import { JwtPayload } from "jsonwebtoken";

import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";


declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        email: string;
        name: string;
        role: Role;
      };
    }
  }
}




export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies.accessToken ? req.cookies.accessToken :
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : req.headers.authorization);

    if (!token) {
      throw new Error("You are not logged in. Please login to access this resource.");
    }

    const verifiedToken = jwtUtils.verifyToken(
      token,
      config.jwt_access_secret,
    );

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    const { email, name, id, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new Error(
        "Forbidden. You don't have permission to access this resource.",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.activeStatus === "BLOCKED") {
      throw new Error("your account has been blocked. Please contact admin.");
    }

    req.user = {
      email,
      name,
      id,
      role,
    };

    next();
  });
};