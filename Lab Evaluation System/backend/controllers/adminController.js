const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =======================
// Admin Login
// =======================
const adminLogin = async (req, res) => {
    try {
        console.log("Login Request:", req.body);

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and Password are required"
            });
        }

        console.log("Searching admin...");

        const result = await pool.query(
            "SELECT * FROM admin WHERE username = $1",
            [username]
        );

        console.log("DB Result:", result.rows);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid Username"
            });
        }

        const admin = result.rows[0];

        console.log("Comparing Password...");

        const isMatch = await bcrypt.compare(password, admin.password);

        console.log("Password Match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        // =======================
        // Save Admin Login History
        // =======================
        try {

            const history = await pool.query(
                `INSERT INTO admin_login_history (admin_id)
         VALUES ($1)
         RETURNING *`,
                [admin.admin_id]
            );

            console.log("✅ History Inserted:", history.rows);

        } catch (err) {

            console.error("❌ History Insert Error:", err);

        }
        console.log("Generating Token...");

        const token = jwt.sign(
            {
                adminId: admin.admin_id,
                username: admin.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token
        });

    } catch (error) {
        console.error("ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =======================
// Add Admin
// =======================
const addAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and Password are required"
            });
        }

        // Check if username already exists
        const checkAdmin = await pool.query(
            "SELECT * FROM admin WHERE username = $1",
            [username]
        );

        if (checkAdmin.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert Admin
        const result = await pool.query(
            `INSERT INTO admin (username, password)
             VALUES ($1, $2)
             RETURNING admin_id, username`,
            [username, hashedPassword]
        );

        return res.status(201).json({
            success: true,
            message: "Admin Added Successfully",
            admin: result.rows[0]
        });

    } catch (error) {
        console.error("ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addFaculty = async (req, res) => {
    try {

        const { name, subject, email, password } = req.body;

        if (!name || !subject || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Email Validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email Address"
            });
        }

        // Check if faculty already exists
        const checkFaculty = await pool.query(
            "SELECT * FROM faculty WHERE email = $1",
            [email]
        );

        if (checkFaculty.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Faculty already exists"
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert Faculty
        await pool.query(
            `INSERT INTO faculty (name, subject, email, password)
             VALUES ($1, $2, $3, $4)`,
            [name, subject, email, hashedPassword]
        );

        return res.status(201).json({
            success: true,
            message: "Faculty Added Successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
// =======================
// Get All Faculty
// =======================
const getAllFaculty = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT faculty_id, name, subject, email
             FROM faculty
             ORDER BY faculty_id ASC`
        );

        return res.status(200).json({
            success: true,
            totalFaculty: result.rows.length,
            faculty: result.rows
        });

    } catch (error) {
        console.error("ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =======================
// Update Faculty
// =======================
const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, subject, email } = req.body;

        if (!name || !subject || !email) {
            return res.status(400).json({
                success: false,
                message: "Name, Subject and Email are required"
            });
        }

        const result = await pool.query(
            `UPDATE faculty
             SET name = $1,
                 subject = $2,
                 email = $3
             WHERE faculty_id = $4
             RETURNING faculty_id, name, subject, email`,
            [name, subject, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Faculty Updated Successfully",
            faculty: result.rows[0]
        });

    } catch (error) {
        console.error("ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =======================
// Delete Faculty
// =======================
const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM faculty
             WHERE faculty_id = $1
             RETURNING faculty_id, name, email`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Faculty Deleted Successfully",
            faculty: result.rows[0]
        });

    } catch (error) {
        console.error("ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =======================
// Get Admin Details
// =======================
const getAdmin = async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT admin_id, username FROM admin"
        );

        return res.status(200).json({
            success: true,
            admin: result.rows
        });

    } catch (error) {

        console.error("ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    adminLogin,
    addAdmin,
    addFaculty,
    getAllFaculty,
    updateFaculty,
    deleteFaculty,
    getAdmin
};