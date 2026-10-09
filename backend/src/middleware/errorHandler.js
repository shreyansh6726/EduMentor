function notFoundHandler(req, res) {
  res.status(404).json({ error: "Route not found" });
}

function errorHandler(error, req, res, next) {
  if (error.name === "ValidationError") {
    res.status(400).json({ error: error.message });
    return;
  }
  if (error.code === 11000) {
    res.status(409).json({ error: "A student with this studentId already exists" });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = { notFoundHandler, errorHandler };
