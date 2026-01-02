import { Request, Response, NextFunction } from "express";

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in");
        return res.redirect("/auth/login");
    }
    next();
};

const storeReturnTo = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

export { isLoggedIn, storeReturnTo };
