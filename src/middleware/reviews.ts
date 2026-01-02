import { Request, Response, NextFunction } from "express";
import { reviewSchema } from "../schemas";
import Review from "../models/reviews";
import ExpressError from "../utils/ExpressError";

const validateReview = (req: Request, res: Response, next: NextFunction) => {
    const result = reviewSchema.validate(req.body, { abortEarly: false });

    if (result.error) {
        const msg = result.error.details
            .map((el: Error) => el.message)
            .join(", ");
        throw new ExpressError(msg, 400);
    }

    next();
};

const checkReviewOwnership = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const reviewId = req.params.reviewid;

    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "No review with requested id");
        return res.redirect(`/campgrounds/${req.params.id}`);
    }

    if (!req.user) {
        req.flash("error", "Somehow you are not logged in");
        return res.redirect("/auth/login");
    }
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of the campground");
        return res.redirect(`/campgrounds/${req.params.id}`);
    }
    next();
};

export { validateReview, checkReviewOwnership };
