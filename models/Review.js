const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add review title"],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, "Please add a text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add rating between 1 and 10"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Prevent user from submitting more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

reviewSchema.statics.getAvergeRating = async function (bootcampId) {
  console.log("Caculate Avg Rating");
  const groupedList = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: { _id: "$bootcamp", averageCost: { $avg: "$rating" } },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: groupedList[0].averageRating,
    });
  } catch (error) {
    console.log(error);
  }

  console.log(groupedList);
};

reviewSchema.post("save", function () {
  console.log("Save Review");
  this.constructor.getAvergeRating(this.bootcamp);
});

reviewSchema.post("remove", function () {
  this.constructor.getAvergeRating(this.bootcamp);
});

module.exports = mongoose.model("Review", reviewSchema);
