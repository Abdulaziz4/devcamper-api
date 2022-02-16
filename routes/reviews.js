const express = require("express");

const { protect, authorize } = require("../middlewares/auth");

const { getReviews } = require("../controllers/reviews");

const router = express.Router({ mergeParams: true });

const Review = require("../models/Review");

const advancedResults = require("../middlewares/advancedResults");

const { route } = require("./bootcamps");

router.route("/").get(
  advancedResults(Review, {
    path: "bootcamp",
    select: "name description",
  }),
  getReviews
);
