const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc        Get all courses
// @route       GET api/v1/courses
// @route       GET api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const course = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({ success: true, data: course });
  } else {
    return res.status(200).json(res.advancedResults);
  }
});

// @desc        Get single course
// @route       GET api/v1/courses/:id
// @access      Public
exports.getSingleCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(new ErrorResponse(404, "No course with the id"));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc        Create new course
// @route       POST api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId; // add id to the body
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  // check if bootcamp exist
  if (!bootcamp) {
    return next(new ErrorResponse(404, "No bootcamp with the id"));
  }

  // Make sure the user is the bootcamp owner
  if (
    req.user.id !== bootcamp.user.id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(401, "User is not authorized to create this course")
    );
  }

  const data = await Course.create(req.body);

  res.status(201).json({ sucess: true, data: data });
});

// @desc        Update course
// @route       PUT api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!data) {
    return next(new ErrorResponse(404, "No course with the id"));
  }

  // Make sure the user is the course owner
  if (req.user.id !== course.user.id.toString() && req.user.role !== "admin") {
    return next(
      new ErrorResponse(401, "User is not authorized to update this course")
    );
  }
  const data = await Course.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({ sucess: true, data: data });
});

// @desc        Delete course
// @route       DELETE api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(404, "No course with this id"));
  }

  // Make sure the user is the course owner
  if (req.user.id !== course.user.id.toString() && req.user.role !== "admin") {
    return next(
      new ErrorResponse(401, "User is not authorized to update this course")
    );
  }
  course.remove();

  res.status(200).json({ sucess: true, data: course });
});
