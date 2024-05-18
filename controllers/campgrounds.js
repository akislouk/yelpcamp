const { cloudinary } = require("../cloudinary");
const mapboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const geocoder = mapboxGeocoding({ accessToken: process.env.MAPBOX_TOKEN || "" });

/** Finds and displays all the campgrounds */
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render("campgrounds/index", { campgrounds, title: "Campgrounds" });
};

/** Displays the new campground form */
module.exports.newForm = async (req, res) =>
    res.render("campgrounds/new", { title: "Add New Campground" });

/** Creates a new campground */
module.exports.create = async (req, res) => {
    // Create the campground
    const campground = new Campground(req.body.campground);

    // Add the location data, images, and owner to the campground
    const geoData = await geocoder
        .forwardGeocode({ query: campground.location, limit: 1 })
        .send();
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.owner = req.user._id;

    // Save the campground
    await campground.save();

    // Display a success message and redirect to the campground's page
    req.flash("success", "Successfully added campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

/** Finds and displays a specific campground */
module.exports.show = async (req, res, next) => {
    // Find the campground
    const campground = await Campground.findById(req.params.id).populate([
        { path: "reviews", populate: { path: "author" } },
        "owner",
    ]);

    // Return an error if the campground is not found
    if (!campground) return next(new ExpressError("Page not found", 404));

    // Display the campground's page
    res.render("campgrounds/show", { campground, title: campground.title });
};

/** Finds the campground and displays its edit form */
module.exports.editForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground, title: campground.title });
};

/** Finds and updates a campground */
module.exports.edit = async (req, res, next) => {
    const { id } = req.params;

    // Find the campground and update it
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });

    // Add the new images to the campground
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);

    // Save the campground
    await campground.save();

    // Delete the selected images from Cloudinary and from the database
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages)
            await cloudinary.uploader.destroy(filename);
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }

    // Display a success message and redirect to the campground's page
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${id}`);
};

/** Finds and deletes a campground */
module.exports.destroy = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);

    // Display a success message and redirect to the campgrounds index page
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
};
