const express = require("express");

const { protect } = require("../middlewares/auth");

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

const router = express.Router();

// Re-route to other resourses
router.use("/:bootcampId/courses", courseRouter);

router.route("/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect,createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);

router.route("/:id/photo").put(protect,uploadBootcampPhoto);

module.exports = router;
