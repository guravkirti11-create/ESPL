// ===============================
// AI Controller - Qwen + Ollama
// ===============================

// Use undici's own fetch + Agent together (same package/version) — mixing
// Node's built-in global fetch with a separately-installed undici Agent
// causes "UND_ERR_INVALID_ARG: invalid onRequestStart method" due to an
// internal API mismatch between the two undici versions.
const { fetch: undiciFetch, Agent } = require("undici");

// A custom undici Agent with a much longer headers/body timeout than the
// default (~300s). Safety margin — should rarely be needed once "think"
// is disabled below, but kept generous in case a particular prompt is slow.
const slowModelAgent = new Agent({
    headersTimeout: 900000, // 15 minutes
    bodyTimeout: 900000     // 15 minutes
});

const evaluateCode = async (req, res) => {

    try {

        const {
            language,
            question,
            source_code
        } = req.body;

        console.log("=================================");
        console.log("AI EVALUATION REQUEST");
        console.log("Language:", language);
        console.log("Question:", question);
        console.log("Source Code:", source_code);
        console.log("=================================");

        // -------------------------------
        // Validate input
        // -------------------------------
        if (!language || !source_code) {

            return res.status(400).json({
                success: false,
                message: "Language and source code are required"
            });

        }

        // -------------------------------
        // System Prompt
        // -------------------------------
        const systemPrompt = `
You are an AI programming lab evaluator.

Evaluate the student's submitted programming code carefully.

Provide the following:

1. Quality Score out of 100
2. Issues Found
3. Expected Output
4. Improvements
5. Best Practices

Check:

- Syntax errors
- Logical errors
- Infinite loops
- Array/list bounds
- Uninitialized variables
- Incorrect calculations
- Division by zero
- Null or unsafe operations
- Code quality
- Readability
- Efficiency
- Best programming practices

Do not invent errors that are not present in the code.

Give a clear and concise evaluation.
`;

        // -------------------------------
        // User Prompt
        // -------------------------------
        const userPrompt = `
Programming Language:
${language}

Question:
${question || "No question provided"}

Student Code:
${source_code}

Evaluate this code according to the system instructions.
`;

        console.log("Sending request to Ollama...");
        console.log("Model: e_sv2:latest");

        // -------------------------------
        // Call Ollama (via undici's own fetch, same version as the Agent)
        // -------------------------------
        const response = await undiciFetch(
            "http://127.0.0.1:11434/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    model: "e_sv2:latest",

                    stream: false,

                    // ⭐ NEW — skip the model's internal chain-of-thought
                    // reasoning phase. This is what was eating most of the
                    // ~5 minute response time (per the earlier full log,
                    // the "thinking" field was huge). With this off, the
                    // model should answer in a few seconds to ~1 minute.
                    think: false,

                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: userPrompt
                        }
                    ]

                }),

                dispatcher: slowModelAgent
            }
        );

        console.log("Ollama HTTP Status:", response.status);

        // -------------------------------
        // Check response
        // -------------------------------
        if (!response.ok) {

            const errorText = await response.text();

            console.error("Ollama Error:");
            console.error(errorText);

            return res.status(500).json({

                success: false,

                message: "Ollama request failed",

                error: errorText

            });

        }

        // -------------------------------
        // Read Ollama response
        // -------------------------------
        const data = await response.json();

        console.log("Ollama Response Received");
        console.log(data);

        // -------------------------------
        // Extract AI response
        // -------------------------------
        const evaluation =
            data?.message?.content || "";

        // -------------------------------
        // Send result to frontend
        // -------------------------------
        return res.status(200).json({

            success: true,

            model: "e_sv2:latest",

            evaluation: evaluation

        });

    }
    catch (error) {

        console.error("===============================");
        console.error("AI EVALUATION ERROR");
        console.error("Name:", error.name);
        console.error("Message:", error.message);
        console.error("Cause:", error.cause);
        console.error("===============================");

        // Friendlier message when it's specifically a timeout
        const isTimeout =
            error.name === "TimeoutError" ||
            error.name === "AbortError" ||
            (error.cause && String(error.cause).includes("HeadersTimeoutError"));

        return res.status(500).json({

            success: false,

            message: isTimeout
                ? "AI Evaluation timed out — the local model is taking longer than expected (over 15 minutes). Please try again, or use a faster model."
                : "AI Evaluation Failed",

            error: error.message,

            cause: error.cause
                ? String(error.cause)
                : null

        });

    }

};


// ===============================
// Export
// ===============================

module.exports = {
    evaluateCode
};