const express = require("express");
const users = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

router.route("/register").get(users.register).post(catchAsync(users.create));
router.route("/login").get(users.loginForm).post(users.login);
router.get("/logout", catchAsync(users.logout));

module.exports = router;
