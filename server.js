const express = require("express");
const dotenv = require("dotenv");
var morgan = require("morgan");
// Routes files
const bootcamps = require("./routes/bootcamps");
// Load the config file
dotenv.config({ path: "./config/config.env" });

const app = express();

// Dev logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Attatch routes
app.use("/api/v1/bootcamps", bootcamps);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode with port ${PORT}`
  )
);
