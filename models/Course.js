const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add course title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  weeks: {
    type: String,
    required: [true, "Please add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Please add a tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
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
});

courseSchema.statics.getAverageCost = async function (bootcampId) {
  const groupedList = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: { _id: "$bootcamp", averageCost: { $avg: "$tuition" } },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: groupedList[0].averageCost,
    });
  } catch (error) {
    console.log(error);
  }

  console.log(groupedList);
};

courseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

courseSchema.post("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});
module.exports = mongoose.model("Course", courseSchema);
