import express, { Request, Response } from "express";

import v1_NewsRoutes from "./routes/v1/news";
import NewsModel from "./models/NewsModel";

const app = express();

app.use(async (req, res, next) => {
    await NewsModel.init()
    next();
})

app.use(express.json());
app.use("/v1/news", v1_NewsRoutes);

export default app;
