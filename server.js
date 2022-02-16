/* eslint-disable no-undef */
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
var cookieParser = require("cookie-parser");
const FileUpload = require("express-fileupload");
const colors = require("colors");
const errorHandler = require("./middlewares/error");
const connectDB = require("./config/db");

// Load the config file
dotenv.config({ path: "./config/config.env" });

// Connect to DB
connectDB();

// Routes files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const app = express();

// Use body parser middleware
app.use(express.json());

// Use cookie parser
app.use(cookieParser());

// Use file uploader
app.use(FileUpload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Dev logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Attatch routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/auth/users", users);
app.use("/api/v1/reviews", reviews);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode with port ${PORT}`.yellow
      .bold
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
