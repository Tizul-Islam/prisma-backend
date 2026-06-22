import { Router } from "express";
import { usersController } from "./users.controller";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import {registerUser} from "./users.service";



const router = Router();


router.post("/register", usersController.createUser);



export const userRouter = router;  

