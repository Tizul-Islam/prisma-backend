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
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/GlobalErrorHandler";

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


// Not Found Handler
app.use(notFound);

// Global Error Handler
app.use(globalErrorHandler);

export default app;