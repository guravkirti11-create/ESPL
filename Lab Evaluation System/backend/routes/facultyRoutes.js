const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});

const {
    facultyLogin,
    addStudent,
    getAllStudents,
    updateStudent,
    deleteStudent,
} = require("../controllers/facultyController");

// =======================
// Faculty Login
// =======================
router.post("/login", facultyLogin);

// =======================
// Student APIs
// =======================
router.post("/student", addStudent);
router.get("/student", getAllStudents);
router.put("/student/:id", updateStudent);
router.delete("/student/:id", deleteStudent);



module.exports = router;