import { Router, Request, Response } from "express";
import * as newsController from "../../controllers/news"

const router = Router();

// GET /v1/news/
router.get("/",  newsController.getNews)

// POST, PUT, PATCH, DELETE, UPDATE /v1/news
router.all("/", (req: Request, res: Response) => {
    res.status(405).json({error: "Not implemented"});
})

export default router; 
