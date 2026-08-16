const express = require("express");

const router = express.Router();

const {
    adminLogin,
    getAdmin,
    addAdmin,
    addFaculty,
    getAllFaculty,
    updateFaculty,
    deleteFaculty
} = require("../controllers/adminController");


// =======================
// Admin Login
// =======================
router.post("/login", adminLogin);


// =======================
// Get Admin Details
// =======================
router.get("/", getAdmin);


// =======================
// Add Admin
// =======================
router.post("/add", addAdmin);


// =======================
// Faculty Management
// =======================
router.post("/faculty", addFaculty);

router.get("/faculty", getAllFaculty);

router.put("/faculty/:id", updateFaculty);

router.delete("/faculty/:id", deleteFaculty);


module.exports = router;