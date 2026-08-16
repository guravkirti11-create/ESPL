const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load Environment Variables
dotenv.config();

// Database Connection
const pool = require("./config/db");

// Import Routes
const adminRoutes = require("./routes/adminRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const examRoutes = require("./routes/examRoutes");
const questionRoutes = require("./routes/questionRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const compilerRoutes = require("./routes/compilerRoutes");
const plagiarismRoutes = require("./routes/plagiarismRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});


// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/submission", submissionRoutes);
app.use("/api/compiler", compilerRoutes);
app.use("/api/plagiarism", plagiarismRoutes);
app.use("/api/ai", aiRoutes);
// Test Route
app.get("/", (req, res) => {
    res.json({
        message: "Lab Evaluation System Backend Running Successfully 🚀"
    });
});

// Check Database Tables
app.get("/tables", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        res.status(200).json({
            success: true,
            totalTables: result.rows.length,
            tables: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch tables",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server Running on Port ${PORT}`);
});