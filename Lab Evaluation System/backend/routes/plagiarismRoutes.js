const express = require("express");

const router = express.Router();

const {
    checkPlagiarism,
    getAllReports
} = require("../controllers/plagiarismController");

// Get All Reports
router.get("/", getAllReports);

// Check Plagiarism
router.post("/", checkPlagiarism);

module.exports = router;