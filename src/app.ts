import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import config from "./config";
import httpStatus from "http-status";
import { sendResponse } from "./utils/sendResponse";
import { userRouter } from "./modules/users/users.route";
import { authRouter } from "./modules/auth/auth.route";
import { postRoutes } from "./modules/post/post.route";
import { commentRoutes } from "./modules/comments/comments.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// Routes
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong.";

  if (
    message.includes("not logged in") ||
    message.includes("jwt") ||
    message.includes("token") ||
    message.includes("credentials")
  ) {
    statusCode = httpStatus.UNAUTHORIZED;
  } else if (
    message.includes("Forbidden") ||
    message.includes("blocked") ||
    message.includes("permission") ||
    message.includes("owner")
  ) {
    statusCode = httpStatus.FORBIDDEN;
  } else if (message.includes("not found")) {
    statusCode = httpStatus.NOT_FOUND;
  } else if (message.includes("already exists")) {
    statusCode = httpStatus.CONFLICT;
  }

  // Only log internal server errors (500) to the console to keep terminal logs clean
  if (statusCode === httpStatus.INTERNAL_SERVER_ERROR) {
    console.error(err);
  }

  sendResponse(res, {
    success: false,
    statusCode,
    message,
  });
});

export default app;