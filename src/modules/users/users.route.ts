import { Router, Request, Response, NextFunction } from "express";
import { usersController } from "./users.controller";

import { auth } from "../../middlewares/auth";
import { Role } from "../../generated/prisma/enums";

const router = Router();

router.post("/register", usersController.createUser);

router.get(
  "/me",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  usersController.getMyProfile,
);

router.put(
  "/my-profile",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  usersController.updateMyProfile,
);

export const userRouter = router;
