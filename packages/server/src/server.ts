import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser"; 

import v1_NewsRoutes from "./routes/v1/news";
import v1_UserRoutes from "./routes/v1/user";

import NewsModel from "./models/NewsModel";
import UserModel from "./models/UserModel";

const app = express();

app.use(cors());

app.use(async (req, res, next) => {
  await NewsModel.init();
  await UserModel.init();
  next();
});

// Add bodyParser middleware for JSON parsing with error handling
app.use(bodyParser.json(), (error, req, res, next) => {
  if (error instanceof SyntaxError) {
    // Handle bad JSON request
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

app.use("/v1/news", v1_NewsRoutes);
app.use("/v1/users", v1_UserRoutes);

export default app;
