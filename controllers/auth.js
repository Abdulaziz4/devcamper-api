const User = require("../models/User");
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

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

// @desc        Get currently loged in user
// @route       POST api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  res.status(200).json({ success: true, data: req.user });
});

// @desc        Sends a token to the user's email address to reset password
// @route       POST api/v1/auth/forgot
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1. Generate Random Hash Token
  // 2. Save the token to the users profile (db) along with expiration date
  // 3. Send an email to the user contains a url and the saved token
  // 4. When user visit the url check the token and the expiration date
  // if valid the password will be reset with the received one
  const user = await User.findOne({ email: req.user.email });

  if (!user) {
    return next(new ErrorResponse(404, "No user with that email"));
  }
  const forgotPasswordToken = user.generateForgotPasswordToken();

  // Save the field changed by [getForgotPasswordToken] method
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${forgotPasswordToken}`;

  let message = `You are receiving this email because you the reset of a password. PLEASE make PUT request to ${resetUrl}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset password",
      text: message,
    });

    return res.status(200).json({ status: true, data: "Message is Sent" });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    return next(new ErrorResponse(500, "Couldn't Send Email"));
  }
});

// @desc        Reset the password for a user
// @route       PUT api/v1/auth/resetpassword/:resettoken
// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse(400, "Invalid token"));
  }

  user.password = req.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

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
