// Import dotenv when in development mode
if (process.env.NODE_ENV !== "production") require("dotenv").config();

// Third-party imports
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

// Local imports
const ExpressError = require("./utils/ExpressError");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const User = require("./models/user");

// Connect to the database
const dbUrl = process.env.DB_URL || "mongodb://0.0.0.0:27017/yelp-camp";
mongoose.set("strictQuery", true);
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Database connected"));

// Create the express app
const app = express();

// Configure the template engine
app.engine("ejs", ejsMate); // Register EJS-Mate as the template engine for EJS files
app.set("view engine", "ejs"); // Set EJS as the default template engine
app.set("views", path.join(__dirname, "views")); // Set the views directory
app.set("view options", { rmWhitespace: true }); // Remove whitespace from rendered HTML to reduce file size

// Mount middleware
app.use(express.urlencoded({ extended: true })); // Parse url-encoded request bodies with the qs library
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the public directory
app.use(methodOverride("_method")); // Override request method to allow PUT and DELETE
app.use(mongoSanitize({ replaceWith: "_" })); // Replace prohibited characters with _

// The secret for session and cookies
const secret = process.env.SECRET || "YelpCampSecret";

// Configure session store
const store = new MongoStore({ mongoUrl: dbUrl, secret, touchAfter: 24 * 60 * 60 });
store.on("error", (err) => console.log("STORE ERROR ", e));

// Configure session
const sessionConfig = {
    name: "session",
    secret,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));
app.use(flash()); // Flash messages. Must be used after session because they are stored in the session

// Configure security headers with Helmet to protect against common web vulnerabilities
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://*.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const imgSrcUrls = [
    "https://res.cloudinary.com/douqbebwk/",
    "https://res.cloudinary.com/djw8bfa5e/",
    "https://images.unsplash.com/",
];
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                fontSrc: ["'self'"],
                imgSrc: ["'self'", "blob:", "data:", ...imgSrcUrls],
                objectSrc: [],
                scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
            },
        },
    }),
);

// Configure passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up local variables to be available in all views
app.use((req, res, next) => {
    res.locals.user = req.user ?? null; // The user's information
    res.locals.title = "YelpCamp"; // The default page title
    res.locals.success = req.flash("success"); // Success flash message
    res.locals.error = req.flash("error"); // Error flash message
    next();
});

// Mount routes
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.get("/", (req, res) => res.render("home"));

// Send a 404 error for any other route
app.all("*", (req, res, next) => next(new ExpressError("Page not found", 404)));

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; // Set the status code to 500 if not specified
    err.message ||= "Something went wrong!"; // Default error message
    res.status(statusCode).render("error", { err, title: "Error" }); // Display the error page
});

// Start the server and listen for requests on the specified port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Serving on port", port));
