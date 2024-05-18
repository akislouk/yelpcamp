const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({ url: String, filename: String });

// A virtual property that changes the image URL to a URL that resizes the image to 200px wide
ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});

// ImageSchema.virtual("card").get(function () {
//     return this.url.replace("/upload", "/upload/ar_1.0,c_scale,g_north,h_400,w_634");
// });

const CampgroundSchema = new Schema(
    {
        title: String,
        price: Number,
        location: String,
        geometry: {
            type: { type: String, enum: ["Point"], required: true },
            coordinates: { type: [Number], require: true },
        },
        description: String,
        images: [ImageSchema],
        owner: { type: Schema.Types.ObjectId, ref: "User" },
        reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    },
    { toJSON: { virtuals: true } },
);

// A virtual property that returns the HTML for a campground's pop-up on the map
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
    return `\
        <h5 class="card-title"><a href="/campgrounds/${this._id}">${this.title}</a></h5>
        <p>${this.description.substring(0, 30)}...</p>`;
});

// A hook that deletes all reviews associated with a campground when the campground is deleted
CampgroundSchema.post("findOneAndDelete", async function (campground) {
    if (campground)
        await mongoose.model("Review").deleteMany({ _id: { $in: campground.reviews } });
});

module.exports = mongoose.model("Campground", CampgroundSchema);
