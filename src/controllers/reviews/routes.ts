import { Request, Response } from "express";
import ExpressError from "../../utils/ExpressError";
import Campground from "../../models/campgrounds";
import Review from "../../models/reviews";

const addReview = async (req: Request, res: Response) => {
    const { rating, body } = req.body;
    const id = req.params.id;

    if (!req.user) {
        req.flash("error", "Somehow you are not logged in");
        return res.redirect("/auth/login");
    }

    const campground = await Campground.findById(id);
    if (!campground) {
        throw new ExpressError("Campground id is invalid", 400);
    }

    const review = new Review({ rating, body });

    review.author = req.user._id;
    await review.save();

    campground.reviews.push(review._id);
    await campground.save();

    req.flash("success", "Successfully added review!");
    res.redirect(`/campgrounds/${id}`);
};

const deleteReview = async (req: Request, res: Response) => {
    const { reviewid: reviewId, id: campgroundId } = req.params;

    await Campground.findByIdAndUpdate(campgroundId, {
        $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Successfully deleted review!");
    res.redirect(`/campgrounds/${campgroundId}`);
};

export { addReview, deleteReview };
