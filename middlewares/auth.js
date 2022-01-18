const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const asyncHandler = require("./async");

// Protect routes and set user
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  // Extract token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    next(new ErrorResponse(401, "Not authorized to access the route"));
  }
  // Check if token exists
  if (!token) {
    next(new ErrorResponse(401, "Not authorized to access the route"));
  }

    // decode token, errors will be catched by asyncHandler
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // set user using decoded payload
    req.user = await User.findById(payload.id);
    next();

});
