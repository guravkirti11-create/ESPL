const pool = require("../config/db");

// =======================
// Create Exam
// =======================
const createExam = async (req, res) => {
    try {
        const {
            faculty_id,
            title,
            subject,
            total_marks,
            duration,
            exam_date
        } = req.body;

        if (
            !faculty_id ||
            !title ||
            !subject ||
            !total_marks ||
            !duration ||
            !exam_date
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO exam
            (faculty_id, title, subject, total_marks, duration, exam_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                faculty_id,
                title,
                subject,
                total_marks,
                duration,
                exam_date
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Exam Created Successfully",
            exam: result.rows[0]
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
// Get All Exams
// =======================
const getAllExams = async (req, res) => {
    try {

        const result = await pool.query(
            `SELECT
                exam_id,
                faculty_id,
                title,
                subject,
                total_marks,
                duration,
                exam_date,
                created_at
             FROM exam
             ORDER BY exam_id ASC`
        );

        return res.status(200).json({
            success: true,
            totalExams: result.rows.length,
            exams: result.rows
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
// Update Exam
// =======================
const updateExam = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            faculty_id,
            title,
            subject,
            total_marks,
            duration,
            exam_date
        } = req.body;

        if (
            !faculty_id ||
            !title ||
            !subject ||
            !total_marks ||
            !duration ||
            !exam_date
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const result = await pool.query(
            `UPDATE exam
             SET faculty_id = $1,
                 title = $2,
                 subject = $3,
                 total_marks = $4,
                 duration = $5,
                 exam_date = $6
             WHERE exam_id = $7
             RETURNING *`,
            [
                faculty_id,
                title,
                subject,
                total_marks,
                duration,
                exam_date,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Exam Updated Successfully",
            exam: result.rows[0]
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
// Delete Exam
// =======================
const deleteExam = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM exam
             WHERE exam_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Exam Deleted Successfully",
            exam: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    createExam,
    getAllExams,
    updateExam,
    deleteExam
};