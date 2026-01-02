import { Request, Response } from "express";
import Campground from "../../models/campgrounds";
import { cloudinary } from "../../cloudinary";
import { destroyAllUploads } from "../../middleware/campgrounds";
import * as maptilerClient from "@maptiler/client";

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY as string;

const processCampImages = async (files: Express.Multer.File[]) => {
    const uploadedImages = await Promise.all(
        files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "YelpCamp",
                transformation: [{ quality: "auto", fetch_format: "auto" }],
            });

            return {
                url: result.secure_url,
                filename: result.public_id,
                size: result.bytes,
            };
        }),
    );

    destroyAllUploads(files);
    return uploadedImages;
};

const addCampground = async (req: Request, res: Response) => {
    if (!req.user) {
        req.flash("error", "Somehow you are not logged in");
        return res.redirect("/auth/login");
    }
    if (!req.files) {
        req.flash("error", "You need to upload an image");
        return res.redirect(req.baseUrl + "/new");
    }

    // Declares files as array of files
    const files = req.files as Express.Multer.File[];
    const uploadedImages = await processCampImages(files);

    const { price, location, description, title } = req.body;
    const camp = new Campground({
        price,
        location,
        description,
        title,
        images: uploadedImages,
    });

    camp.author = req.user._id;
    req.flash("success", "Successfully added campground!");
    await camp.save();

    res.redirect(req.baseUrl);
};

const editCampground = async (req: Request, res: Response) => {
    const { title, location, price, description, image } = req.body;
    const id = req.params.id;

    if (!req.files) {
        req.flash("error", "You need to upload an image");
        return res.redirect(req.baseUrl + "/edit");
    }

    // Declares files as array of files
    const files = req.files as Express.Multer.File[];
    const uploadedImages = await processCampImages(files);

    const campground = await Campground.findByIdAndUpdate(
        id,
        { title, location, price, description },
        { runValidators: true },
    );
    if (!campground) {
        req.flash("error", "Update request failed, try again later");
        return res.redirect(`${req.baseUrl}/${id}/edit`);
    }
    campground.images.push(...uploadedImages);
    await campground.save();

    req.flash("success", "Successfully edited campground!");
    res.redirect(`${req.baseUrl}/${id}`);
};

const deleteCampground = async (req: Request, res: Response) => {
    await Campground.findByIdAndDelete(req.params.id);

    req.flash("success", "Successfully deleted campground!");
    res.redirect(`${req.baseUrl}`);
};

const deleteImages = async (req: Request, res: Response) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Update request failed, try again later");
        return res.redirect(`${req.baseUrl}/${req.params.id}/delete-img`);
    }
    if (req.body.deleteImages) {
        for (const filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }
    res.redirect(`${req.baseUrl}/${req.params.id}`);
};

export { addCampground, editCampground, deleteCampground, deleteImages };
