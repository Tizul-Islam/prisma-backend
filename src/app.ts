import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import httpStatus from "http-status";
import config from "./config";
import { userRouter } from "./modules/users/users.route";
import { authRouter } from "./modules/auth/auth.route";
import { sendResponse } from "./utils/sendResponse";
import cookieParser from "cookie-parser";

const app: Application = express();

// CORS setup
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// cookie parser
app.use(cookieParser());


app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// app.post();

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof Error && err.message === "Invalid credentials") {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Invalid credentials. Please check your email and password.",
    });
  }

  sendResponse(res, {
    success: false,
    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
    message: "Something went wrong.",
  });
});




export default app;
