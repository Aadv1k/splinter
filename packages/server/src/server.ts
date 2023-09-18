import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser"; 

import v1_NewsRoutes from "./routes/v1/news";
import v1_UserRoutes from "./routes/v1/user";

import NewsModel from "./models/NewsModel";
import UserModel from "./models/UserModel";

const app = express();

app.use(cors());

app.use(async (req: Request, res: Response, next: NextFunction) => {
  await NewsModel.init();
  await UserModel.init();
  next();
});

app.use(bodyParser.json());

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError) {
    const errorResponse = {
      error: {
        code: "Bad_Request",
        message: "Bad Request",
        description: "Invalid JSON data in the request body",
      },
      http_status: 400,
    };
    return res.status(400).json(errorResponse);
  }
  next();
});

app.use("/api/v1/news", v1_NewsRoutes);
app.use("/api/v1/users", v1_UserRoutes);

export default app;
