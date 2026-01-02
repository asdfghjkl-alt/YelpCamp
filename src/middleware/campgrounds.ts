import { Request, Response, NextFunction } from "express";
import Campground from "../models/campgrounds";
import { campgroundSchema, deleteImagesSchema } from "../schemas";
import ExpressError from "../utils/ExpressError";
import fs from "fs";

const MB_SIZE = 1024 * 1024;

const MAX_FILE_SIZE_MB = 7;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * MB_SIZE;

const MAX_TOTAL_SIZE_MB = 15;
const MAX_TOTAL_SIZE = MAX_TOTAL_SIZE_MB * MB_SIZE;

const MAX_FILES = 5;

const checkCampgroundOwnership = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const id = req.params.id;

    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "No campground with requested id");
        return res.redirect(req.baseUrl);
    }

    if (!req.user) {
        req.flash("error", "Somehow you are not logged in");
        return res.redirect("/auth/login");
    }
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of the campground");
        return res.redirect(req.baseUrl + `/${id}`);
    }
    next();
};

const validateCampground = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const result = campgroundSchema.validate(req.body, { abortEarly: false });

    if (result.error) {
        const msg = result.error.details.map((el) => el.message).join(", ");
        throw new ExpressError(msg, 400);
    }

    next();
};

const validateDeleteImages = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const result = deleteImagesSchema.validate(req.body, { abortEarly: false });

    if (result.error) {
        const msg = result.error.details.map((el) => el.message).join(", ");
        throw new ExpressError(msg, 400);
    }

    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Something went wrong in finding the campground");
        return res.redirect(`${req.baseUrl}/${req.params.id}/delete-img`);
    }

    if (campground.images.length - req.body.deleteImages.length <= 0) {
        req.flash("error", "Must keep at least one image!");
        return res.redirect(`${req.baseUrl}/${req.params.id}`);
    }
    next();
};

const onImgUploadError = (
    req: Request,
    res: Response,
    files: Express.Multer.File[],
    message: string,
    redirectUrl: string,
) => {
    req.flash("error", message);
    destroyAllUploads(files);
    res.redirect(req.baseUrl + redirectUrl);

    return false;
};

const validateImages = (
    req: Request,
    res: Response,
    files: Express.Multer.File[],
    initNoFiles: number,
    initFileSizes: number,
    redirectUrl: string,
) => {
    if (files.length + initNoFiles < 0) {
        return onImgUploadError(
            req,
            res,
            files,
            `Need at least one image`,
            redirectUrl,
        );
    }
    if (files.length + initNoFiles > MAX_FILES) {
        return onImgUploadError(
            req,
            res,
            files,
            `Only ${MAX_FILES} are allowed to be uploaded in total.`,
            redirectUrl,
        );
    }

    let totalSize = initFileSizes;
    for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
            return onImgUploadError(
                req,
                res,
                files,
                `File "${file.originalname}" is too large (Max ${MAX_FILE_SIZE_MB}MB).`,
                redirectUrl,
            );
        }
        totalSize += file.size;
    }
    if (totalSize > MAX_TOTAL_SIZE) {
        return onImgUploadError(
            req,
            res,
            files,
            `Total size exceeds limit of ${MAX_TOTAL_SIZE_MB}MB.`,
            redirectUrl,
        );
    }

    return true;
};

const checkInitImagesValid = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (!req.files) {
        req.flash("error", "Unexpected error in processing files");
        return res.redirect(req.baseUrl + "/new");
    }
    const files = req.files as Express.Multer.File[];
    if (!validateImages(req, res, files, 0, 0, "/new")) {
        return;
    }

    next();
};

const checkEditImagesValid = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (!req.files) {
        req.flash("error", "Unexpected error in processing files");
        return res.redirect(`${req.baseUrl}/${req.params.id}/edit`);
    }
    const files = req.files as Express.Multer.File[];
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Campground with sent id could not be found");
        return res.redirect(`${req.baseUrl}`);
    }

    const initNoFiles = campground.images.length;
    const initFileSizes = campground.images.reduce(
        (acc, file) => acc + file.size,
        0,
    );

    if (
        !validateImages(
            req,
            res,
            files,
            initNoFiles,
            initFileSizes,
            `${req.params.id}/edit`,
        )
    ) {
        return;
    }
    next();
};

const destroyAllUploads = (files: Express.Multer.File[]) => {
    files.forEach((file) => {
        fs.unlinkSync(file.path);
    });
};

export {
    checkCampgroundOwnership,
    validateCampground,
    validateDeleteImages,
    checkInitImagesValid,
    checkEditImagesValid,
    destroyAllUploads,
};
