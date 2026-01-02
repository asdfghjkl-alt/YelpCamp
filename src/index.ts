import "./loader";
import { NextFunction, Request, Response } from "express";
import path, { dirname } from "path";
import methodOverride from "method-override";
import { fileURLToPath } from "url";
import ejsMate from "ejs-mate";
import mongoose from "mongoose";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import ExpressError from "./utils/ExpressError";
import campgroundPages from "./routes/campgrounds/pages";
import campgroundRoutes from "./routes/campgrounds/routes";
import reviewRoutes from "./routes/reviews/routes";
import authPages from "./routes/auth/pages";
import authRoutes from "./routes/auth/routes";
import flash from "express-flash";
import passport from "passport";
import helmet from "helmet";
import { Strategy as LocalStrategy } from "passport-local";
import User, { IUser } from "./models/user";

let dbUrl: string;

if (process.env.NODE_ENV !== "production") {
    dbUrl = "mongodb://localhost:27017/yelp-camp";
} else {
    dbUrl = process.env.DB_URL as string;
}
mongoose.connect(dbUrl as string);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Getting directory name from index.ts
app.engine("ejs", ejsMate);
// Setting view engine to ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Extends HTTP methods past just GET
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());

// Allow access to files in public
const staticPath = path.join(__dirname, "../public");
app.use(express.static(staticPath));
// Uses flash
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/",
    "https://cdn.jsdelivr.net/npm",
    "https://code.jquery.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
    "https://cdn.maptiler.com/maptiler-sdk-js/",
    "https://cdn.maptiler.com/maptiler-geocoding-control/",
    "https://cdn.jsdelivr.net/npm/",
];

const fontSrcUrls: string[] = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
                "https://images.unsplash.com",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    }),
);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET as string,
    },
});

const sessionConfig = {
    store,
    name: "session",
    secret: process.env.SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 1,
        secure: process.env.NODE_ENV === "production",
    },
};
app.use(session(sessionConfig));

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface User extends IUser {}
    }
}
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.currentUser = req.user;
    next();
});

app.get("/", (req: Request, res: Response) => {
    res.render("home");
});

app.use("/campgrounds", campgroundPages);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/auth", authPages);
app.use("/auth", authRoutes);
app.get("/test", (req: Request, res: Response) => {
    res.render("test", {
        title: "test",
        maptilerApiKey: process.env.MAPTILER_API_KEY,
    });
});

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError("Page not found", 404));
});

app.use(
    (
        err: { statusCode?: number; message?: string },
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        void next;
        const { statusCode = 500 } = err as {
            statusCode?: number;
        };
        if (!err.message) {
            err.message = "Something went wrong";
        }

        res.status(statusCode).render("error", { title: "Error", err });
    },
);

app.listen(3000, () => {
    console.log("Server Started!");
});
