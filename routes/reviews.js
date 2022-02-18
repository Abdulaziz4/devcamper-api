const express = require("express");

const { protect, authorize } = require("../middlewares/auth");

const {
  getReviews,
  getReview,
  createReview,
  deleteReview,
  updateReview,
} = require("../controllers/reviews");

const router = express.Router({ mergeParams: true });

const Review = require("../models/Review");

const advancedResults = require("../middlewares/advancedResults");

const { route } = require("./bootcamps");

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), createReview);

router
  .route("/:id")
  .get(getReview)
  .put(protect, authorize("user", "admin"), updateReview)
  .delete(protect, authorize("user", "admin"), deleteReview);

module.exports = router;
