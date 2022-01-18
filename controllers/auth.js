const User = require("../models/User");
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc        Register new user
// @route       POST api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const createdUser = await User.findOne({ email });

  if (createdUser) {
    return next(new ErrorResponse(409, "User already registered"));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

// @desc        Login new user
// @route       POST api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse(404, "Please procide an email or password"));
  }

  // Get the user from db, include password in the returned model
  const user = await User.findOne({ email }).select("+password");

  // check if user with the email exist
  if (!user) {
    return next(new ErrorResponse(401, "Invalid credentials"));
  }

  // check if password is correct
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(401, "Invalid credentials"));
  }

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwt();

  const options = {
    // Convert 30 int to 30 days
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    // On https
    options.scure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

// @desc        Get currently loged in user
// @route       POST api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {

  console.log(req.user);
  res.status(200).json({ success: true, data: req.user });
});
