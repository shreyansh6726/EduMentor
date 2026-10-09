const fs = require("fs");
const path = require("path");

const schemaPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "ml",
  "artifacts",
  "feature_schema.json"
);
const featureSchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

function validateStudentPayload(req, res, next) {
  const { studentId, name, email, predictionFeatures } = req.body;
  if (!studentId || !name || !email || !predictionFeatures) {
    res.status(400).json({
      error: "studentId, name, email, and predictionFeatures are required"
    });
    return;
  }

  const received = Object.keys(predictionFeatures).sort();
  const expected = [...featureSchema.features].sort();
  if (JSON.stringify(received) !== JSON.stringify(expected)) {
    res.status(400).json({
      error: "predictionFeatures must exactly match the trained model feature schema",
      missingFeatures: expected.filter((feature) => !received.includes(feature)),
      unexpectedFeatures: received.filter((feature) => !expected.includes(feature))
    });
    return;
  }

  next();
}

module.exports = validateStudentPayload;
