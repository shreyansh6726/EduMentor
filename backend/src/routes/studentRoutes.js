const express = require("express");
const validateStudentPayload = require("../middleware/validateStudent");
const {
  createStudent,
  listStudents,
  getStudent,
  updateStudent
} = require("../controllers/studentController");

const router = express.Router();

router.post("/", validateStudentPayload, createStudent);
router.get("/", listStudents);
router.get("/:id", getStudent);
router.put("/:id", validateStudentPayload, updateStudent);

module.exports = router;
