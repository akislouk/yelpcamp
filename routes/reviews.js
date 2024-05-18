const express = require("express");
const reviews = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateReview } = require("../middleware");

const router = express.Router({ mergeParams: true });

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.create));
router.delete(
    "/:reviewId",
    isLoggedIn,
    catchAsync(isAuthor),
    catchAsync(reviews.destroy),
);

module.exports = router;
