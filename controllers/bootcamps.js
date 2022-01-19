const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const gecoder = require("../utils/gecoder");
const Bootcamp = require("../models/Bootcamp");

// @desc        Get all bootcamps
// @route       GET api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp with id ${req.params.id} doesn't exist`)
    );
  }

  // Make sure the user is the bootcamp owner
  if (
    req.user.id !== bootcamp.user.id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(401, "User is not authorized to update this bootcamp")
    );
  }

  const updatedBootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
    returnOriginal: false,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updatedBootcamp });
});

// @desc        Deletes bootcamp
// @route       DELETE api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp with id ${req.params.id} doesn't exist`)
    );
  }
  // Make sure the user is the bootcamp owner
  if (
    req.user.id !== bootcamp.user.id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(401, "User is not authorized to update this bootcamp")
    );
  }

  bootcamp.remove(); // Using remove will activiate the cascade delete hook
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

// @desc        Uploads a photo bootcamp
// @route       PUT api/v1/bootcamps/:id/photo
// @access      Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp with id ${req.params.id} doesn't exist`)
    );
  }
  // Make sure the user is the bootcamp owner
  if (
    req.user.id !== bootcamp.user.id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(401, "User is not authorized to update this bootcamp")
    );
  }
  // Check if a file is sent
  if (!req.files) {
    return next(new ErrorResponse(400, "Please upload a file"));
  }

  const file = req.files.file;

  // Check if it's an image
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(400, "Please upload an image"));
  }

  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(new ErrorResponse(400, "File is too big"));
  }
  // Custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(500, "Error while uploading the file"));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
