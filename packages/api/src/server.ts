import express, { Request, Response } from "express";

import v1_NewsRoutes from "./routes/v1/news";

const app = express();

app.use(express.json());
app.use("/v1/news", v1_NewsRoutes);

export default app;
