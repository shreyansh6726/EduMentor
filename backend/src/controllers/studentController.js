const Student = require("../models/Student");

async function createStudent(req, res, next) {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
}

async function listStudents(req, res, next) {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    res.json(students);
  } catch (error) {
    next(error);
  }
}

async function getStudent(req, res, next) {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
}

module.exports = { createStudent, listStudents, getStudent, updateStudent };
