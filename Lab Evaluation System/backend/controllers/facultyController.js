const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// =======================
// Faculty Login
// =======================
const facultyLogin = async (req, res) => {
    try {

        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM faculty WHERE email=$1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email"
            });
        }

        const faculty = result.rows[0];

        const isMatch = await bcrypt.compare(
            password,
            faculty.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        const token = jwt.sign(
            {
                facultyId: faculty.faculty_id,
                email: faculty.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Faculty Login Successful",
            token,
            faculty: {
                faculty_id: faculty.faculty_id,
                name: faculty.name,
                email: faculty.email,
                subject: faculty.subject
            }
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
// Add Student
// =======================
const addStudent = async (req, res) => {

    try {

        const {
            faculty_id,
            name,
            roll_no,
            enrollment_no,
            seat_no
        } = req.body;

        if (
            !faculty_id ||
            !name ||
            !roll_no ||
            !enrollment_no ||
            !seat_no
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Roll No. and Enrollment No. must contain digits only
        if (!/^\d+$/.test(String(roll_no))) {
            return res.status(400).json({
                success: false,
                message: "Roll No. must contain digits only"
            });
        }

        if (!/^\d+$/.test(String(enrollment_no))) {
            return res.status(400).json({
                success: false,
                message: "Enrollment No. must contain digits only"
            });
        }

        const check = await pool.query(
            "SELECT * FROM student WHERE enrollment_no=$1",
            [enrollment_no]
        );

        if (check.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Student already exists"
            });
        }

        await pool.query(
            `INSERT INTO student
            (faculty_id,name,roll_no,enrollment_no,seat_no)
            VALUES($1,$2,$3,$4,$5)`,
            [
                faculty_id,
                name,
                roll_no,
                enrollment_no,
                seat_no
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Student Added Successfully"
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
// Get All Students
// =======================
const getAllStudents = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                student_id,
                faculty_id,
                name,
                roll_no,
                enrollment_no,
                seat_no
            FROM student
            ORDER BY student_id ASC
        `);

        return res.status(200).json({
            success: true,
            totalStudents: result.rows.length,
            students: result.rows
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
// Update Student
// =======================
const updateStudent = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            faculty_id,
            name,
            roll_no,
            enrollment_no,
            seat_no
        } = req.body;

        if (
            !faculty_id ||
            !name ||
            !roll_no ||
            !enrollment_no ||
            !seat_no
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Roll No. and Enrollment No. must contain digits only
        if (!/^\d+$/.test(String(roll_no))) {
            return res.status(400).json({
                success: false,
                message: "Roll No. must contain digits only"
            });
        }

        if (!/^\d+$/.test(String(enrollment_no))) {
            return res.status(400).json({
                success: false,
                message: "Enrollment No. must contain digits only"
            });
        }

        const result = await pool.query(
            `UPDATE student
             SET
                faculty_id=$1,
                name=$2,
                roll_no=$3,
                enrollment_no=$4,
                seat_no=$5
             WHERE student_id=$6
             RETURNING *`,
            [
                faculty_id,
                name,
                roll_no,
                enrollment_no,
                seat_no,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student Updated Successfully",
            student: result.rows[0]
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
// Delete Student
// =======================
const deleteStudent = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM student
             WHERE student_id=$1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student Deleted Successfully"
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
// Exports
// =======================
module.exports = {
    facultyLogin,
    addStudent,
    getAllStudents,
    updateStudent,
    deleteStudent,

};