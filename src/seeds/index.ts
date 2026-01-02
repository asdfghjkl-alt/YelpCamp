import mongoose from "mongoose";
import Campground from "../models/campgrounds";
import cities from "./cities";
import { descriptors, places } from "./seedHelpers";

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array: string[]) =>
    array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30);
        const c = new Campground({
            location: {
                name: `${cities[random1000].city}, ${cities[random1000].state}`,
                lat: Math.random() * 180 - 90,
                lng: Math.random() * 360 - 180,
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: "https://res.cloudinary.com/ddebsxexj/image/upload/v1767223422/YelpCamp/wml4y5vsolkhrpjtfup0.jpg",
                    filename: "YelpCamp/wml4y5vsolkhrpjtfup0",
                    size: 14707,
                },
                {
                    url: "https://res.cloudinary.com/ddebsxexj/image/upload/v1767223423/YelpCamp/zuvtq9sr5tyeel9wacsw.jpg",
                    filename: "YelpCamp/zuvtq9sr5tyeel9wacsw",
                    size: 101534,
                },
            ],
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer malesuada nulla dolor, id aliquet massa varius eget. Quisque sed ligula mi. Aliquam non viverra sapien. Nam ultricies condimentum nulla, vitae ultrices velit placerat sed. Maecenas turpis dolor, scelerisque eu consectetur sed, varius ac augue. Quisque dapibus tellus viverra erat pharetra tempus. Duis tempus congue ante, non mollis mauris posuere at. Sed eros nibh, tempus ac nibh non, dignissim elementum metus. Vivamus a semper elit, at dignissim lacus.",
            author: "695303caf46886e0a88e38db",
            price,
        });
        await c.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
