const fs = require("fs");
const dotenv = require("dotenv");
const colors = require("colors");
const mongosse = require("mongoose");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Require models
const Bootcamp = require("./models/Bootcamp");

// Connect to DB
mongosse.connect(process.env.MONGO_URI);

// Load data file
const filePath = `${__dirname}/_data/bootcamps.json`;
const jsonData = JSON.parse(fs.readFileSync(filePath));

// Import to db
const importData = async () => {
  try {
    await Bootcamp.create(jsonData);
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
    console.log("Data Destroyed...".green.inverse);
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
