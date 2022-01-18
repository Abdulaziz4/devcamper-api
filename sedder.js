// node sedder.js -i => to import data
// node sedder.js -d => to destroy data

const fs = require("fs");
const dotenv = require("dotenv");
const colors = require("colors");
const mongosse = require("mongoose");
// Load env vars
dotenv.config({ path: "./config/config.env" });

// Require models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const User = require("./models/User");

// Connect to DB
mongosse.connect(process.env.MONGO_URI);

// Load data file
const bootcampsFilePath = `${__dirname}/_data/bootcamps.json`;
const bootcampsJsonData = JSON.parse(fs.readFileSync(bootcampsFilePath));

const coursesFilePath = `${__dirname}/_data/courses.json`;
const coursesJsonData = JSON.parse(fs.readFileSync(coursesFilePath));

const usersFilePath = `${__dirname}/_data/users.json`;
const usersJsonData = JSON.parse(fs.readFileSync(usersFilePath));

// Import to db
const importData = async () => {
  try {
    await Bootcamp.create(bootcampsJsonData);
    await Course.create(coursesJsonData);
    await User.create(usersJsonData);

    console.log("Data Imported...".green.inverse);
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

// Destroy db
const destoryData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();

    console.log("Data Destroyed...".red.inverse);
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  destoryData();
} else {
  console.log("Unknown Flag".red);
}
