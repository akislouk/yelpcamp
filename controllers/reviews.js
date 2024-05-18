const Campground = require("../models/campground");
const Review = require("../models/review");

/** Creates a new review */
module.exports.create = async (req, res) => {
    // Find the campground
    const campground = await Campground.findById(req.params.id);

    // Create the review and add it to the campground's reviews
    const review = new Review({ ...req.body.review, author: req.user._id });
    campground.reviews.push(review);

    // Save the review and the campground
    await review.save();
    await campground.save();

    // Display a success message and redirect to the campground's page
    req.flash("success", "Successfully added your review!");
    res.redirect(`/campgrounds/${campground._id}`);
};

/** Deletes a review */
module.exports.destroy = async (req, res) => {
    const { id, reviewId } = req.params;

    // Find the campground and remove the review from it
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Display a success message and redirect to the campground's page
    req.flash("success", "Successfully deleted review!");
    res.redirect(`/campgrounds/${id}`);
};
