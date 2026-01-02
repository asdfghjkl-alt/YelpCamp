import express, { Request, Response } from "express";
import { loginPg } from "../../controllers/auth/pages";

const router = express.Router();

router.get("/register", (req: Request, res: Response) => {
    res.render("auth/register", { title: "Register Page" });
});
router.get("/login", loginPg);

export default router;
