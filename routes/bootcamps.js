const express = require("express");

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  deleteBootcamp,
  updateBootcamp,
  getBootcampsInRadius,
} = require("../controllers/bootcamps");

// Other resourses routeres
const courseRouter = require("./courses");

const router = express.Router();

// Re-route to other resourses
router.use("/:bootcampId/courses", courseRouter);

router.route("/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/").get(getBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
