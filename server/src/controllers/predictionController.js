const Prediction = require("../models/Prediction");
const Student = require("../models/Student");
const { runPrediction } = require("../services/mlService");

function riskLevel(probability) {
  const medium = Number(process.env.RISK_MEDIUM_THRESHOLD || 0.34);
  const high = Number(process.env.RISK_HIGH_THRESHOLD || 0.67);
  if (probability >= high) return "High";
  if (probability >= medium) return "Medium";
  return "Low";
}

async function createPrediction(req, res, next) {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const result = await runPrediction(Object.fromEntries(student.predictionFeatures));
    const prediction = await Prediction.create({
      student: student._id,
      model: result.model,
      modelVersion: result.modelVersion,
      predictedClass: result.predictedClass,
      riskProbability: result.riskProbability,
      riskLevel: riskLevel(result.riskProbability),
      shapExplanation: result.shapExplanation
    });
    res.status(201).json(prediction);
  } catch (error) {
    next(error);
  }
}

async function listPredictions(req, res, next) {
  try {
    const predictions = await Prediction.find({ student: req.params.studentId })
      .sort({ predictedAt: -1 })
      .lean();
    res.json(predictions);
  } catch (error) {
    next(error);
  }
}

async function latestPrediction(req, res, next) {
  try {
    const prediction = await Prediction.findOne({ student: req.params.studentId })
      .sort({ predictedAt: -1 })
      .lean();
    if (!prediction) {
      res.status(404).json({ error: "No predictions found for this student" });
      return;
    }
    res.json(prediction);
  } catch (error) {
    next(error);
  }
}

module.exports = { createPrediction, listPredictions, latestPrediction };
