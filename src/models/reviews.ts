import { Schema, model } from "mongoose";

const reviewSchema = new Schema({
    body: { type: String, required: true },
    rating: { type: Number, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Review = model("Review", reviewSchema);

export default Review;
