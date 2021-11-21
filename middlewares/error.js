const ErrorResponse = require("../utils/errorResponse");

// @desc  Handles common errors, and ends the request-response cycle
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.log(err);
  // Mongoose bad/not exist object id
  if (err.name === "CastError") {
    const message = `Resource with id ${err.value} not found`;
    error = new ErrorResponse(404, message);
  }

  //Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(400, message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((error) => error.message);
    error = new ErrorResponse(400, message);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Server Error" });
};

module.exports = errorHandler;
