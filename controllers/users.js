const passport = require("passport");
const User = require("../models/user");

/** Displays the registration form */
module.exports.register = (req, res) =>
    res.render("users/register", { title: "Register" });

/** Creates a new user */
module.exports.create = async (req, res) => {
    try {
        // Destructure the request body
        const { username, email, password } = req.body;

        // Create the user
        const user = new User({ username, email });
        const newUser = await User.register(user, password);

        // Log the user in
        req.login(newUser, (err) => {
            if (err) return next(err);

            // Display a success message and redirect to the campgrounds index
            req.flash("success", "Welcome to YelpCamp!");
            res.redirect("/campgrounds");
        });
    } catch (error) {
        // Display an error message and redirect to the registration form
        req.flash("error", error.message);
        res.redirect("/register");
    }
};

/** Displays the login form */
module.exports.loginForm = (req, res) => res.render("users/login", { title: "Login" });

/** Logs the user in */
module.exports.login = passport.authenticate("local", {
    keepSessionInfo: true,
    failureFlash: true,
    failureRedirect: "/login",
    successFlash: "Welcome back!",
    successReturnToOrRedirect: "/campgrounds",
});

/** Logs the user out */
module.exports.logout = async (req, res, next) =>
    req.logout((err) => {
        if (err) return next(err);

        // Display a success message and redirect to the home page
        req.flash("success", "You are now signed out. Goodbye!");
        res.redirect("/campgrounds");
    });
