const mongoose = require("mongoose");

const explanationSchema = new mongoose.Schema(
  {
    feature: { type: String, required: true },
    contribution: { type: Number, required: true },
    direction: {
      type: String,
      enum: ["Positive", "Negative", "Neutral"],
      required: true
    }
  },
  { _id: false }
);

const predictionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true
    },
    model: { type: String, required: true },
    modelVersion: { type: String, required: true },
    predictedClass: {
      type: String,
      enum: ["Dropout", "Enrolled", "Graduate"],
      required: true
    },
    riskProbability: { type: Number, required: true, min: 0, max: 1 },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true
    },
    shapExplanation: { type: [explanationSchema], required: true },
    predictedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

predictionSchema.index({ student: 1, predictedAt: -1 });

module.exports = mongoose.model("Prediction", predictionSchema);
