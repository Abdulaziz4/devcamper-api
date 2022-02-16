const express = require("express");

const { protect, authorize } = require("../middlewares/auth");

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  deleteBootcamp,
  updateBootcamp,
  getBootcampsInRadius,
  uploadBootcampPhoto,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");

const advancedResults = require("../middlewares/advancedResults");

// Other resourses routeres
const courseRouter = require("./courses");
const reviewsRouter = require("./reviews");

const router = express.Router();

// Re-route to other resourses
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewsRouter);

router.route("/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), uploadBootcampPhoto);

module.exports = router;
