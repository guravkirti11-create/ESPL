const express = require("express");

const router = express.Router();

const {
    addQuestion,
    getAllQuestions,
    updateQuestion,
    deleteQuestion
} = require("../controllers/questionController");

// Add Question
router.post("/", addQuestion);

// Get All Questions
router.get("/", getAllQuestions);

// Update Question
router.put("/:id", updateQuestion);

// Delete Question
router.delete("/:id", deleteQuestion);

module.exports = router;