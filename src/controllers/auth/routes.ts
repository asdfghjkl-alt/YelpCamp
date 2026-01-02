import { Request, Response, NextFunction } from "express";
import User from "../../models/user";

const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Yelp Camp!");
            res.redirect("/campgrounds");
        });
    } catch (e) {
        if (e instanceof Error) {
            req.flash("error", e.message);
        } else {
            req.flash("error", "Unknown error occurred");
        }
        res.redirect(req.baseUrl + "/register");
    }
};

const login = async (req: Request, res: Response) => {
    req.flash("success", "Welcome back!");

    const redirectUrl = res.locals.returnTo || "/campgrounds";
    res.redirect(redirectUrl);
};

const logout = (req: Request, res: Response, next: NextFunction) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/campgrounds");
    });
};

export { register, login, logout };
