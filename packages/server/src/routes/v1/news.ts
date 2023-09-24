import { Router, Request, Response } from "express";
import * as newsController from "../../controllers/news"
import { ErrorCode, ServerResponse } from "../../types";

const router = Router();

// GET /v1/news/
router.get("/",  newsController.getNews);

// POST /v1/news/vote/:id
router.post("/vote/:id",  newsController.postVote);

// POST, PUT, PATCH, DELETE, UPDATE /v1/news
router.all("/", (req: Request, res: Response) => {
  const errorResponse: ServerResponse = {
    status: "error",
    error: {
      code: ErrorCode.MethodNotAllowed,
      message: "Method Not Allowed",
      description: "This route does not support the HTTP method used.",
    },
  };
  res.status(405).json(errorResponse);
});

export default router; 
