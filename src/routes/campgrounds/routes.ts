import express from "express";
import {
    checkCampgroundOwnership,
    checkInitImagesValid,
    checkEditImagesValid,
    validateCampground,
    validateDeleteImages,
} from "../../middleware/campgrounds";
import { isLoggedIn } from "../../middleware/auth";
import {
    addCampground,
    deleteCampground,
    deleteImages,
    editCampground,
} from "../../controllers/campgrounds/routes";
import multer from "multer";

const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        // Allowed ext
        const filetypes = /jpeg|jpg|png|webp/;
        // Check mime
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype) {
            return cb(null, true);
        } else {
            cb(
                new Error(
                    "Error: Images Only! Allowed formats: jpeg, jpg, png, webp",
                ),
            );
        }
    },
});
const router = express.Router();

router.post(
    "/",
    isLoggedIn,
    validateCampground,
    upload.array("images"),
    checkInitImagesValid,
    addCampground,
);
router
    .route("/:id")
    .put(
        isLoggedIn,
        checkCampgroundOwnership,
        validateCampground,
        upload.array("images"),
        checkEditImagesValid,
        editCampground,
    )
    .delete(isLoggedIn, checkCampgroundOwnership, deleteCampground);
router.delete(
    "/:id/delete-img",
    isLoggedIn,
    checkCampgroundOwnership,
    validateDeleteImages,
    deleteImages,
);

export default router;
