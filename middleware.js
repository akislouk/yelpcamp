const isValidObjectId = require("mongoose").isValidObjectId;
const Campground = require("./models/campground");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./schemas.js");

/** Proceeds if the user is logged in, otherwise redirects to the login page */
module.exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) next();
    else {
        req.session.returnTo = req.originalUrl; // Save the URL the user was trying to access
        req.flash("error", "You need to sign in first!");
        res.redirect("/login");
    }
};

/** Checks if the campground exists and if the user is the owner of the campground */
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;

    // Find the campground and check if it exists
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Campground doesn't exist!");
        return res.redirect("/campgrounds");
    }

    if (campground.owner.equals(req.user._id)) next();
    else {
        req.flash("error", "You don't have permission to do that!");
        res.redirect(`/campgrounds/${id}`);
    }
};

/** Checks if the campground and the review exist and if the user is the author of the review */
module.exports.isAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;

    // Find the campground and check if it exists
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Campground doesn't exist!");
        return res.redirect("/campgrounds");
    }

    // Find the review and check if it exists
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review doesn't exist!");
        return res.redirect(`/campgrounds/${id}`);
    }

    if (review.author.equals(req.user._id)) next();
    else {
        req.flash("error", "You don't have permission to do that!");
        res.redirect(`/campgrounds/${id}`);
    }
};

/** Checks if the ID is a valid MongoDB object ID */
module.exports.isValidId = (req, res, next) => {
    if (isValidObjectId(req.params.id)) next();
    else next(new ExpressError("Page not found", 404));
};

/** Validates the campground data against the campground schema */
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else next();
};

/** Validates the review data against the review schema */
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else next();
};
