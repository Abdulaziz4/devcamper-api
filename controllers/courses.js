const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc        Get all courses
// @route       GET api/v1/courses
// @route       GET api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let courses;
  if (req.params.bootcampId) {
    courses = await Course.find({ bootcamp: req.params.bootcampId });
  } else {
    courses = await Course.find().populate({
      path: "bootcamp",
      select: "name description",
    });
  }

  res.status(200).json({
    status: true,
    count: courses.length,
    data: courses,
  });
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
    return next(new ErrorResponse("No course with the id", 404));
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

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  // check if bootcamp exist
  if (!bootcamp) {
    return next(new ErrorResponse("No bootcamp with the id", 404));
  }

  const data = await Course.create(req.body);

  res.status(201).json({ sucess: true, data: data });
});

// @desc        Update course
// @route       PUT api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const data = await Course.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!data) {
    return next(new ErrorResponse("No course with the id", 404));
  }

  res.status(200).json({ sucess: true, data: data });
});

// @desc        Delete course
// @route       DELETE api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse("No cousr with this id", 404));
  }

  course.remove();

  res.status(200).json({ sucess: true, data: course });
});
