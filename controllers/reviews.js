const Review = require("../models/Review");

const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");
const { update } = require("../models/Review");

// @desc        Get reviews
// @route       GET api/v1/reviews
// @route       GET api/v1/boocamps/:bootcampId/reviews
// @access      Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc        Get single review
// @route       GET api/v1/reviews/:id
// @access      Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(new ErrorResponse(404, "Can't find the review"));
  }
  res.status(200).json({
    status: true,
    data: review,
  });
});

// @desc        Create a review
// @route       POST api/v1/boocamps/:bootcampId/reviews
// @access      Private
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(404, "No bootcamp with the id"));
  }
  const review = await Review.create(req.body);

  res.status(201).json({ success: true, data: review });
});

// @desc        Delete a review
// @route       DELETE api/v1/reviews/:id
// @access      Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new ErrorResponse(404, "Can't be found"));
  }

  // Check the review belong to the user or the user is admin
  if (req.user.id === review.user.toString() || req.user.role === "admin") {
    return res.status(201).json({ success: true, data: null });
  } else {
    return next(new ErrorResponse(403, "Unauthorize to delete the review"));
  }
});

// @desc        Update a review
// @route       PUT api/v1/reviews/:id
// @access      Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(404, "Can't find the review"));
  }

  // Check the review belong to the user or the user is admin
  if (req.user.id === review.user.toString() || req.user.role === "admin") {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(201).json({ success: true, data: updatedReview });
  } else {
    return next(new ErrorResponse(403, "Unauthorize to update the review"));
  }
});
