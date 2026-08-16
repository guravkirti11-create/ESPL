const pool = require("../config/db");

// =======================
// Submit Code
// =======================
const submitCode = async (req, res) => {

    try {

        const {
            student_id,
            question_id,
            language,
            source_code,
            output,
            obtained_marks,
            status,
            input_method,
            paste_percentage,
            paste_event_count
        } = req.body;


        console.log("========== Submission Request ==========");
        console.log(req.body);


        if (
            !student_id ||
            !question_id ||
            !language ||
            !source_code
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }


        const result = await pool.query(

            `INSERT INTO submission
            (
                student_id,
                question_id,
                language,
                source_code,
                output,
                obtained_marks,
                status,
                input_method,
                paste_percentage,
                paste_event_count,
                submitted_at
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
            RETURNING *`,

            [
                student_id,
                question_id,
                language,
                source_code,
                output || "",
                obtained_marks || 0,
                status || "Pending",
                input_method || null,
                paste_percentage != null ? paste_percentage : null,
                paste_event_count != null ? paste_event_count : null
            ]

        );


        return res.status(201).json({

            success: true,
            message: "Submission Saved Successfully",
            submission: result.rows[0]

        });


    } catch (error) {

        console.error("Submission Error:", error);


        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};





// =======================
// Faculty - Get All Submissions
// =======================
const getAllSubmissions = async (req, res) => {


    try {


        const result = await pool.query(`

            SELECT

                s.submission_id,

                st.name AS student_name,

                st.enrollment_no,

                st.seat_no,

                q.title AS question_title,

                s.language,

                s.obtained_marks,

                s.status,

                s.submitted_at,

                s.source_code,

                s.output,

                s.input_method,

                s.paste_percentage


            FROM submission s


            JOIN student st

            ON s.student_id = st.student_id


            JOIN question q

            ON s.question_id = q.question_id


            ORDER BY s.submission_id DESC


        `);



        return res.status(200).json({

            success: true,

            totalSubmissions: result.rows.length,

            submissions: result.rows

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
// Student - Get All Submissions
// =======================
const getStudentSubmissions = async (req, res) => {


    try {


        const { student_id } = req.params;


        const result = await pool.query(`

            SELECT *

            FROM submission

            WHERE student_id=$1

            ORDER BY submission_id DESC


        `, [student_id]);



        return res.status(200).json({

            success: true,

            submissions: result.rows

        });



    } catch (error) {


        return res.status(500).json({

            success: false,

            message: error.message

        });


    }


};






// =======================
// Latest Student Submission
// =======================
const getLatestSubmission = async (req, res) => {

    try {

        const { student_id } = req.params;


        const result = await pool.query(

            `
            SELECT *

            FROM submission

            WHERE student_id=$1

            ORDER BY submission_id DESC

            LIMIT 1
            `,

            [student_id]

        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "No submission found"

            });

        }



        return res.status(200).json({

            success: true,

            submission: result.rows[0]

        });



    } catch (error) {


        console.error("Latest Submission Error:", error);


        return res.status(500).json({

            success: false,

            message: error.message

        });


    }

};







// =======================
// Delete Submission
// =======================
const deleteSubmission = async (req, res) => {


    try {


        const { id } = req.params;


        const result = await pool.query(

            `
            DELETE FROM submission
            WHERE submission_id=$1
            RETURNING *
            `,

            [id]

        );



        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,
                message: "Submission not found"

            });

        }



        return res.status(200).json({

            success: true,

            message: "Submission Deleted Successfully"

        });



    } catch (error) {


        return res.status(500).json({

            success: false,

            message: error.message

        });


    }


};



module.exports = {

    submitCode,

    getAllSubmissions,

    getStudentSubmissions,

    getLatestSubmission,

    deleteSubmission

};