import { Router } from "express";
import { authController } from "./auth.controller";
// import { usersController } from "../users/users.controller";


const router = Router();

router.post("/login", authController.loginUser)

// router.get("/me", usersController.getMyProfile)
router.post("/refresh-token",authController.refreshToken)

export const authRouter = router;