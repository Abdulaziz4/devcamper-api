const asyncHandler = require("../middlewares/async");

// @desc        Register new user
// @route       POST api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true });
});
