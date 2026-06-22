import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { userRouter } from "./modules/users/users.route";

const app: Application = express();

// CORS setup
app.use(
  cors({
    origin: config.APP_URL,
    credentials: true,
  }),
);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// app.post();

app.use("/api/users", userRouter);

export default app;




