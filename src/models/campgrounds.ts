import { Schema, model } from "mongoose";
import { cloudinary } from "../cloudinary";
import Review from "./reviews";
import sanitizeHtml from "sanitize-html";

const imageSchema = new Schema({
    _id: { _id: false },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
});
imageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200,h_150,c_fill");
});
imageSchema.virtual("main").get(function () {
    return this.url.replace("/upload", "/upload/w_600,h_450,c_fill");
});
imageSchema.virtual("display").get(function () {
    return this.url.replace("/upload", "/upload/w_400,h_300,c_fill");
});

const locationSchema = new Schema({
    _id: { _id: false },
    name: { type: String, required: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
});

const campgroundSchema = new Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    location: locationSchema,
    images: [imageSchema],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
});

campgroundSchema.post("findOneAndDelete", async function (campground) {
    await Review.deleteMany({ _id: { $in: campground.reviews } });
    for (const { filename } of campground.images) {
        await cloudinary.uploader.destroy(filename);
    }
});

campgroundSchema.virtual("properties.popUpMarkup").get(function () {
    const safeTitle = sanitizeHtml(this.title);
    const safeDescription = sanitizeHtml(this.description);

    return `
    <strong><a href="/campgrounds/${this._id}">${safeTitle}</a></strong>
    <p>${safeDescription.substring(0, 20)}...</p>`;
});

const Campground = model("Campground", campgroundSchema);

export default Campground;
