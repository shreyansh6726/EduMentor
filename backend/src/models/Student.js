const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    predictionFeatures: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

studentSchema.index({ email: 1 });

module.exports = mongoose.model("Student", studentSchema);
