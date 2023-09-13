import { Router, Request, Response } from "express";
import * as userController from "../../controllers/user"

const router = Router();

// GET /v1/users/login
router.post("/login",  userController.loginUser)

// POST /v1/users/register
router.post("/register",  userController.registerUser)

// GET /v1/users/key
router.get("/key",  userController.issueKeyForUser)

// POST, PUT, PATCH, DELETE, UPDATE /v1/user
router.all("/", (req: Request, res: Response) => {
    res.status(405).json({error: "Not implemented"});
})

export default router; 
