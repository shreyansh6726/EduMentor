require("dotenv").config();

const cors = require("cors");
const express = require("express");
const connectDatabase = require("./config/db");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const predictionRoutes = require("./routes/predictionRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const port = Number(process.env.PORT || 5000);
const clientOrigin = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
).trim().replace(/\/+$/, "");

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "edumentor-backend" });
});
app.use("/api/students", studentRoutes);
app.use("/api/predictions", predictionRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`EduMentor API listening on port ${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error(`Unable to start server: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = app;
