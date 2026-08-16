const axios = require("axios");

const executeCode = async (script, language, versionIndex, stdin) => {

    try {

        console.log("========== JDoodle Request ==========");
        console.log("Language:", language);
        console.log("Version:", versionIndex);
        console.log("Input:", stdin);


        const response = await axios.post(

            "https://api.jdoodle.com/v1/execute",

            {
                clientId: process.env.JDOODLE_CLIENT_ID,

                clientSecret: process.env.JDOODLE_CLIENT_SECRET,

                script: script,

                language: language,

                versionIndex: versionIndex,

                stdin: stdin || ""
            },

            {
                headers: {
                    "Content-Type": "application/json"
                }
            }

        );


        console.log("========== JDoodle Response ==========");
        console.log(
            JSON.stringify(response.data, null, 2)
        );


        return response.data;


    } catch (error) {


        console.error(
            "========== JDoodle Error =========="
        );


        console.error(
            error.response?.data || error.message
        );


        throw error;

    }

};


module.exports = {
    executeCode
};