const { executeCode } = require("../services/jdoodleService");

// =======================
// Compile & Execute Code
// =======================
const compileCode = async (req, res) => {
    try {

        const { source_code, language, stdin } = req.body;


        if (!source_code || !language) {
            return res.status(400).json({
                success: false,
                message: "Source code and language are required"
            });
        }


        let jdoodleLanguage = "";
        let versionIndex = "";


        switch (language.toLowerCase().trim()) {

            case "java":
            case "java 17":
                jdoodleLanguage = "java";
                versionIndex = "5";
                break;


            case "python":
            case "python 3":
            case "python3":
            case "python 3.8":
                jdoodleLanguage = "python3";
                versionIndex = "4";
                break;


            case "c":
                jdoodleLanguage = "c";
                versionIndex = "5";
                break;


            case "c++":
            case "cpp":
                jdoodleLanguage = "cpp17";
                versionIndex = "1";
                break;


            default:

                return res.status(400).json({
                    success: false,
                    message: "Unsupported language"
                });

        }



        console.log("Language:", jdoodleLanguage);
        console.log("Input:", stdin);



        const result = await executeCode(

            source_code,

            jdoodleLanguage,

            versionIndex,

            stdin

        );



        return res.status(200).json({

            success: true,

            output: result.output || "",

            memory: result.memory || "",

            cpuTime: result.cpuTime || "",

            statusCode: result.statusCode || ""

        });



    } catch (error) {


        console.error(
            "Compiler Controller Error:",
            error.response?.data || error.message
        );


        return res.status(500).json({

            success: false,

            message: "Compilation Failed",

            error: error.response?.data || error.message

        });


    }
};



module.exports = {
    compileCode
};