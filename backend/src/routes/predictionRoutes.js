const express = require("express");
const {
  createPrediction,
  listPredictions,
  latestPrediction
} = require("../controllers/predictionController");

const router = express.Router();

router.post("/:studentId", createPrediction);
router.get("/:studentId", listPredictions);
router.get("/:studentId/latest", latestPrediction);

module.exports = router;
