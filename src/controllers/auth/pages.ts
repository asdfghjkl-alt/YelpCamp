import { Request, Response } from "express";

const registerPg = (req: Request, res: Response) => {
    res.render("auth/register", { title: "Register Page" });
};

const loginPg = (req: Request, res: Response) => {
    res.render("auth/login", { title: "Login Page" });
};

export { registerPg, loginPg };
