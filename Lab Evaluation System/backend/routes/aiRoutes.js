const express = require("express");

const router = express.Router();

const {
    evaluateCode
} = require("../controllers/aiController");

// AI Code Evaluation
router.post(
    "/evaluate",
    evaluateCode
);

module.exports = router;