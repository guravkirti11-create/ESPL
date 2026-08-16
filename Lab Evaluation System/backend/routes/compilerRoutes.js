const express = require("express");

const router = express.Router();

const {
    compileCode
} = require("../controllers/compilerController");

router.post("/run", compileCode);

module.exports = router;
