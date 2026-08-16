const pool = require("../config/db");


// =====================================
// Normalize Code
// =====================================
const normalizeCode = (code) => {

    return code
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, "")
        .toLowerCase();

};


// =====================================
// Generate K-Grams
// =====================================
const generateKGrams = (text, k = 5) => {

    const grams = [];

    for (let i = 0; i <= text.length - k; i++) {

        grams.push(text.substring(i, i + k));

    }

    return grams;

};


// =====================================
// Hash Function
// =====================================
const hashGram = (gram) => {

    let hash = 0;

    for (let i = 0; i < gram.length; i++) {

        hash =
            (hash * 31 + gram.charCodeAt(i))
            % 1000000007;

    }

    return hash;

};


// =====================================
// Generate Hashes
// =====================================
const generateHashes = (grams) => {

    return grams.map(hashGram);

};


// =====================================
// Winnowing Fingerprints
// =====================================
const generateFingerprints = (hashes, windowSize = 4) => {

    const fingerprints = [];


    for (let i = 0; i <= hashes.length - windowSize; i++) {

        const window =
            hashes.slice(i, i + windowSize);


        const minHash = Math.min(...window);

        fingerprints.push(minHash);

    }


    return [...new Set(fingerprints)];

};



// =====================================
// Similarity Calculation
// =====================================
const calculateSimilarity = (fp1, fp2) => {


    const set1 = new Set(fp1);
    const set2 = new Set(fp2);


    let common = 0;


    for (const value of set1) {

        if (set2.has(value)) {

            common++;

        }

    }


    const total = Math.max(
        set1.size,
        set2.size
    );


    if (total === 0)
        return 0;


    return Number(
        ((common / total) * 100)
            .toFixed(2)
    );


};



// =====================================
// Status
// (codeLength1/codeLength2 = normalized length
//  of each submission's code. inputMethod1/2 =
//  "Typed"/"Mixed"/"Pasted" from the editor's
//  paste-tracking. A high match is only treated
//  as real "copying" if at least one side actually
//  pasted code in — two students independently
//  TYPING the same simple answer is not copying.)
// =====================================
const MIN_CODE_LENGTH = 150;

const getStatus = (
    similarity,
    codeLength1 = 999,
    codeLength2 = 999,
    inputMethod1 = null,
    inputMethod2 = null
) => {

    if (codeLength1 < MIN_CODE_LENGTH || codeLength2 < MIN_CODE_LENGTH) {
        return "Short";
    }

    if (similarity >= 80) {

        const eitherPasted =
            inputMethod1 === "Pasted" ||
            inputMethod2 === "Pasted";

        return eitherPasted ? "High" : "TypedMatch";
    }


    if (similarity >= 50)
        return "Medium";


    return "Low";

};



// =====================================
// Check Plagiarism (UPSERT — re-running an
// already-checked pair updates the existing
// row instead of throwing a duplicate error)
// =====================================
const checkPlagiarism = async (req, res) => {


    try {


        const {
            submission_id,
            compared_submission_id
        } = req.body;



        if (!submission_id || !compared_submission_id) {

            return res.status(400).json({

                success: false,

                message: "Both submission IDs are required"

            });

        }




        if (
            Number(submission_id) ===
            Number(compared_submission_id)
        ) {

            return res.status(400).json({

                success: false,

                message: "Cannot compare same submission"

            });

        }




        // Get submission 1

        const submission1 = await pool.query(

            `SELECT source_code, input_method
 FROM submission
 WHERE submission_id=$1`,

            [submission_id]

        );




        // Get submission 2

        const submission2 = await pool.query(

            `SELECT source_code, input_method
 FROM submission
 WHERE submission_id=$1`,

            [compared_submission_id]

        );





        if (
            submission1.rows.length === 0 ||
            submission2.rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message: "Submission not found"

            });

        }




        const code1 =
            normalizeCode(
                submission1.rows[0].source_code
            );



        const code2 =
            normalizeCode(
                submission2.rows[0].source_code
            );




        if (!code1 || !code2) {

            return res.status(400).json({

                success: false,

                message: "Empty code found"

            });

        }




        // K-Gram

        const grams1 =
            generateKGrams(code1);


        const grams2 =
            generateKGrams(code2);



        // Hash

        const hashes1 =
            generateHashes(grams1);


        const hashes2 =
            generateHashes(grams2);



        // Fingerprint

        const fp1 =
            generateFingerprints(hashes1);


        const fp2 =
            generateFingerprints(hashes2);




        // Similarity

        const similarity =
            calculateSimilarity(fp1, fp2);




        // Status

        const status =
            getStatus(
                similarity,
                code1.length,
                code2.length,
                submission1.rows[0].input_method,
                submission2.rows[0].input_method
            );




        // Save Report — UPSERT so re-running the same
        // pair updates the existing row instead of erroring.

        const result = await pool.query(

            `INSERT INTO plagiarism_report
(
submission_id,
compared_submission_id,
similarity_percentage,
status
)
VALUES($1,$2,$3,$4)
ON CONFLICT (submission_id, compared_submission_id)
DO UPDATE SET
    similarity_percentage = EXCLUDED.similarity_percentage,
    status = EXCLUDED.status
RETURNING *`,

            [
                submission_id,
                compared_submission_id,
                similarity,
                status
            ]

        );



        return res.status(200).json({

            success: true,

            similarity,

            status,

            report: result.rows[0]

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





// =====================================
// Get All Reports (one row per student —
// shows each student's HIGHEST similarity match,
// whichever side of the pair they were on)
// =====================================
const getAllReports = async (req, res) => {


    try {


        const result = await pool.query(`

            SELECT DISTINCT ON (combined.student_id)

                combined.student_id,
                combined.student_name,
                combined.similarity_percentage,
                combined.status

            FROM (

                SELECT
                    st.student_id,
                    st.name AS student_name,
                    pr.similarity_percentage,
                    pr.status
                FROM plagiarism_report pr
                JOIN submission s ON pr.submission_id = s.submission_id
                JOIN student st ON s.student_id = st.student_id

                UNION ALL

                SELECT
                    st.student_id,
                    st.name AS student_name,
                    pr.similarity_percentage,
                    pr.status
                FROM plagiarism_report pr
                JOIN submission s ON pr.compared_submission_id = s.submission_id
                JOIN student st ON s.student_id = st.student_id

            ) combined

            ORDER BY combined.student_id, combined.similarity_percentage DESC

        `);


        return res.status(200).json({

            success: true,

            reports: result.rows

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

    checkPlagiarism,

    getAllReports

};