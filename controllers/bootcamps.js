const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const gecoder = require("../utils/gecoder");
const Bootcamp = require("../models/Bootcamp");

// @desc        Get all bootcamps
// @route       GET api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc        Get single bootcamp
// @route       GET api/v1/bootcamp/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp with id ${req.params.id} doesn't exist`)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Creates new bootcamp
// @routes      POST api/vq/bootcamps
// @access      Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const data = await Bootcamp.create(req.body);

  res.status(201).json({ success: true, data: data });
});

// @desc        Update bootcamp
// @route       PUT api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const updatedBootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
    returnOriginal: false,
  });

  if (!updatedBootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp with id ${req.params.id} doesn't exist`)
    );
  }
  res.status(200).json({ success: true, data: updatedBootcamp });
});

// @desc        Deletes bootcamp
// @route       DELETE api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp with id ${req.params.id} doesn't exist`)
    );
  }
  res.status(200).json({ success: true, data: {} });
});

// @desc        Get bootcamps within radius
// @route       GET api/v1/bootcamps/:zipcode/:distance
// @access      Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get coordinates from zipcode
  const loc = await gecoder.geocode(zipcode);
  const long = loc[0].longitude;
  const lat = loc[0].latitude;

  // Calc the radius usgin radiuns
  // Divide dis by the radius of Earth
  // Earth Radius= 6,378km
  const radius = distance / 6378;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
