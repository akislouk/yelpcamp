const express = require("express");
const multer = require("multer");
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isOwner, isValidId, validateCampground } = require("../middleware");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const router = express.Router();

router
    .route("/")
    .get(catchAsync(campgrounds.index))
    .post(
        isLoggedIn,
        upload.array("image"),
        validateCampground,
        catchAsync(campgrounds.create),
    );

router.get("/new", isLoggedIn, catchAsync(campgrounds.newForm));

router
    .route("/:id")
    .get(isValidId, catchAsync(campgrounds.show))
    .put(
        isLoggedIn,
        isValidId,
        catchAsync(isOwner),
        upload.array("image"),
        validateCampground,
        catchAsync(campgrounds.edit),
    )
    .delete(isLoggedIn, isValidId, catchAsync(isOwner), catchAsync(campgrounds.destroy));

router.get(
    "/:id/edit",
    isLoggedIn,
    isValidId,
    catchAsync(isOwner),
    catchAsync(campgrounds.editForm),
);

module.exports = router;
