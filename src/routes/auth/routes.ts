import express from "express";
import passport from "passport";
import { storeReturnTo } from "../../middleware/auth";
import { login, logout, register } from "../../controllers/auth/routes";

const router = express.Router();

router.post("/register", register);
router.post(
    "/login",
    storeReturnTo,
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/auth/login",
    }),
    login,
);

router.post("/logout", logout);

export default router;
