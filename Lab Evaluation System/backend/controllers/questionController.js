const pool = require("../config/db");

// =======================
// Add Question
// =======================
const addQuestion = async (req, res) => {

    try {

        const {
            title,
            problem_statement,
            marks,
            exam_time,
            start_time,
            end_time,
            student_id
        } = req.body;

        if (
            !title ||
            !problem_statement ||
            !marks ||
            !exam_time ||
            !start_time ||
            !end_time
        ) {

            return res.status(400).json({
                success: false,
                message: "Title, Problem Statement, Marks, Exam Time, Start Time and End Time are required"
            });

        }

        const result = await pool.query(

            `
            INSERT INTO question
           (
             title,
             problem_statement,
             marks,
             exam_time,
             start_time,
             end_time,
             student_id
           )
           VALUES($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            `,

            [

                title,
                problem_statement,
                marks,
                exam_time,
                start_time,
                end_time,
                student_id || null
            ]


        );

        return res.status(201).json({

            success: true,
            message: "Question Added Successfully",
            question: result.rows[0]

        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// =======================
// Get All Questions
// (optionally filtered by ?student_id=... so a student only sees
// the question(s) sent specifically to them)
// =======================
const getAllQuestions = async (req, res) => {

    try {

        const { student_id } = req.query;

        let result;

        if (student_id) {

            result = await pool.query(

                `
                SELECT
                    question_id,
                    title,
                    problem_statement,
                    marks,
                    exam_time,
                    start_time,
                    end_time,
                    student_id
                FROM question
                WHERE student_id = $1 OR student_id IS NULL
                ORDER BY question_id DESC
                `,

                [student_id]

            );

        } else {

            result = await pool.query(

                `
                SELECT
                    question_id,
                    title,
                    problem_statement,
                    marks,
                    exam_time,
                    start_time,
                    end_time,
                    student_id
                FROM question
                ORDER BY question_id DESC
                `

            );

        }

        return res.status(200).json({

            success: true,
            questions: result.rows

        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// =======================
// Update Question
// =======================
const updateQuestion = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            title,
            problem_statement,
            marks,
            exam_time,
            start_time,
            end_time,
            student_id
        } = req.body;

        const result = await pool.query(

            `
            UPDATE question
            SET
                title = $1,
                problem_statement = $2,
                marks = $3,
                exam_time = $4,
                start_time = $5,
                end_time = $6,
                student_id = $7
            WHERE question_id = $8
            RETURNING *
            `,

            [

                title,
                problem_statement,
                marks,
                exam_time,
                start_time,
                end_time,
                student_id,
                id
            ]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,
                message: "Question not found"

            });

        }

        return res.status(200).json({

            success: true,
            message: "Question Updated Successfully",
            question: result.rows[0]

        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// =======================
// Delete Question
// =======================
const deleteQuestion = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(

            `
            DELETE FROM question
            WHERE question_id = $1
            RETURNING *
            `,

            [id]

        );

        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,
                message: "Question not found"

            });

        }

        return res.status(200).json({

            success: true,
            message: "Question Deleted Successfully",
            question: result.rows[0]

        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {

    addQuestion,
    getAllQuestions,
    updateQuestion,
    deleteQuestion

};