const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
} = require("../controllers/auth");

const { protect } = require("../middlewares/auth");

const router = express.Router();

router
  .post("/register", register)
  .post("/login", login)
  .get("/me", protect, getMe)
  .post("/forgotpassword", protect, forgotPassword)
  .put("/resetpassword/:resettoken", resetPassword)
  .put("/updatedetails", protect, updateDetails)
  .put("/updatepassword", protect, updatePassword);

module.exports = router;
