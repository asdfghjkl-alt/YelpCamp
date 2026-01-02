import express from "express";
import { checkCampgroundOwnership } from "../../middleware/campgrounds";
import { isLoggedIn } from "../../middleware/auth";
import {
    deleteCampgroundPg,
    editCampgroundPg,
    indexPg,
    newCampgroundPg,
    viewCampgroundPg,
} from "../../controllers/campgrounds/pages";

const router = express.Router();

router.get("/", indexPg);
router.get("/new", isLoggedIn, newCampgroundPg);
router.get("/:id", viewCampgroundPg);
router.get("/:id/edit", isLoggedIn, checkCampgroundOwnership, editCampgroundPg);
router.get(
    "/:id/delete-img",
    isLoggedIn,
    checkCampgroundOwnership,
    deleteCampgroundPg,
);

export default router;
