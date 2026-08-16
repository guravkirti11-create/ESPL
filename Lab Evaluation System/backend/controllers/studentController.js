const pool = require("../config/db");
const jwt = require("jsonwebtoken");

// =======================
// Student Login
// =======================
const studentLogin = async (req, res) => {
    try {

        const { name, enrollment_no, seat_no } = req.body;

        // Check all fields
        if (!name || !enrollment_no || !seat_no) {
            return res.status(400).json({
                success: false,
                message: "Name, Enrollment Number and Seat Number are required"
            });
        }

        // Check Name + Enrollment No + Seat No
        const result = await pool.query(
            `SELECT *
             FROM student
             WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
             AND TRIM(enrollment_no) = TRIM($2)
             AND TRIM(seat_no) = TRIM($3)`,
            [
                name,
                enrollment_no,
                seat_no
            ]
        );

        // Invalid credentials
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid Student Name, Enrollment Number or Seat Number"
            });
        }

        // Valid student
        const student = result.rows[0];

        // Create JWT Token
        const token = jwt.sign(
            {
                studentId: student.student_id,
                enrollment_no: student.enrollment_no
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        // Login successful
        return res.status(200).json({
            success: true,
            message: "Student Login Successful",
            token,

            student: {
                student_id: student.student_id,
                faculty_id: student.faculty_id,
                name: student.name,
                roll_no: student.roll_no,
                enrollment_no: student.enrollment_no,
                seat_no: student.seat_no
            }
        });

    } catch (error) {

        console.error("Student Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    studentLogin
};