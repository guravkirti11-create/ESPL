const express = require("express");

const router = express.Router();

const {
    submitCode,
    getAllSubmissions,
    getStudentSubmissions,
    getLatestSubmission,
    deleteSubmission
} = require("../controllers/submissionController");


// Submit Code
router.post("/", submitCode);


// Faculty - Get All Submissions
router.get("/", getAllSubmissions);


// Student - Get All Submissions
router.get("/student/:student_id", getStudentSubmissions);


// Student Report - Latest Submission
router.get("/latest/:student_id", getLatestSubmission);


// Delete Submission
router.delete("/:id", deleteSubmission);


module.exports = router;