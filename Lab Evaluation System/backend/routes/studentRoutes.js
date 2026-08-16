const express = require("express");

const router = express.Router();

const {
    studentLogin
} = require("../controllers/studentController");

// Student Login
router.post("/login", studentLogin);

module.exports = router;