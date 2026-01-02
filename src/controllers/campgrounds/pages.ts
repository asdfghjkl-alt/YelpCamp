import { Request, Response } from "express";
import Campground from "../../models/campgrounds";

const indexPg = async (req: Request, res: Response) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds, title: "All Campgrounds" });
};

const newCampgroundPg = (req: Request, res: Response) => {
    res.render("campgrounds/new", { title: "New Campground" });
};

const viewCampgroundPg = async (req: Request, res: Response) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: { path: "author", select: "username" },
        })
        .populate("author", "username");
    if (!campground) {
        req.flash("error", "Cannot find campground");
        return res.redirect(req.baseUrl);
    }

    res.render("campgrounds/show", { campground, title: "Viewing Campground" });
};

const editCampgroundPg = async (req: Request, res: Response) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Could not find campground to edit");
        return res.redirect(req.baseUrl);
    }
    res.render("campgrounds/edit", {
        campground,
        title: "Editing Campground",
        totalImageSize: campground.images.reduce(
            (acc, file) => acc + file.size,
            0,
        ),
        totalImageNo: campground.images.length,
    });
};

const deleteCampgroundPg = async (req: Request, res: Response) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Could not find campground to edit");
        return res.redirect(req.baseUrl);
    }
    res.render("campgrounds/deleteImg", {
        campground,
        title: "Deleting Images",
    });
};

export {
    indexPg,
    newCampgroundPg,
    viewCampgroundPg,
    editCampgroundPg,
    deleteCampgroundPg,
};
