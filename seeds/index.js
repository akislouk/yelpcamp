if (process.env.NODE_ENV !== "production") require("dotenv").config();
const mongoose = require("mongoose");
const Campground = require("../models/campground");
const Review = require("../models/review");
const User = require("../models/user");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

// Connect to the database
mongoose.set("strictQuery", true);
mongoose.connect(process.env.DB_URL || "mongodb://0.0.0.0:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Database connected"));
db.once("close", () => console.log("Database disconnected"));

/** Returns a random element from an array */
const sample = (array) => array[Math.floor(Math.random() * array.length)];

/** Seeds the database with 300 campgrounds */
const seedDB = async () => {
    // Delete all existing campgrounds and reviews
    await Campground.deleteMany();
    await Review.deleteMany();

    // Find the first user in the database
    const user = await User.findOne();

    // Create 300 campgrounds
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            price,
            description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            owner: user._id,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude],
            },
            images: [
                {
                    url: "https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png",
                    filename: "YelpCamp/ahfnenvca4tha00h2ubt",
                },
                {
                    url: "https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png",
                    filename: "YelpCamp/ruyoaxgf72nzpi4y6cdi",
                },
            ],
        });
        await camp.save();
    }
};

// Seed the database and close the connection
seedDB().then(() => console.log("Seeding complete") || mongoose.connection.close());
