const express = require("express");

const router = express.Router();

const {
    createExam,
    getAllExams,
    updateExam,
    deleteExam
} = require("../controllers/examController");

router.post("/", createExam);
router.get("/", getAllExams);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

module.exports = router;