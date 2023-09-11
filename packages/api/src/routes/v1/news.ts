import { Router, Request, Response } from "express";

const router = Router();


// GET /v1/news/
router.get("/", (req: Request, res: Response) => {
    res.status(500).json({error: "Not implemented"});
})

// POST, PUT, PATCH, DELETE, UPDATE /v1/news
router.all("/", (req: Request, res: Response) => {
    res.status(405).json({error: "Not implemented"});
})

export default router; 
