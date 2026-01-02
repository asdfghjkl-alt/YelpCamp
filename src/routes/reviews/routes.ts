import express from "express";
import { checkReviewOwnership, validateReview } from "../../middleware/reviews";
import { isLoggedIn } from "../../middleware/auth";
import { addReview, deleteReview } from "../../controllers/reviews/routes";

// Merges in params from the parent
const router = express.Router({ mergeParams: true });

router.post("/", isLoggedIn, validateReview, addReview);
router.delete("/:reviewid", isLoggedIn, checkReviewOwnership, deleteReview);

export default router;
