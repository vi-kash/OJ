import express from "express";
import { authenticate } from "../middlewares/requireAuth.js";
import fs from "fs";
import path, { dirname } from "path";
import { v4 as uuid } from "uuid";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import Problem from "../models/Problem.js";
import User from "../models/User.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// Directory setup for storing code files, inputs, and outputs
const dirFiles = path.join(__dirname, "..", "programFiles");
const dirCodes = path.join(__dirname, "..", "programFiles", "codes");
const dirInputs = path.join(__dirname, "..", "programFiles", "inputs");
const dirOutputs = path.join(__dirname, "..", "programFiles", "outputs");

// Ensure directories exist or create them if they don't
fs.mkdirSync(dirFiles, { recursive: true });
fs.mkdirSync(dirCodes, { recursive: true });
fs.mkdirSync(dirInputs, { recursive: true });
fs.mkdirSync(dirOutputs, { recursive: true });

// Function to generate a code file
const generateFile = async (format, content) => {
    const jobID = uuid();
    const fileName = `${jobID}.${format}`;
    const filePath = path.join(dirCodes, fileName);
    fs.writeFileSync(filePath, content);
    return filePath;
};

// Function to generate an input file
const generateInputFile = async (filePath, input) => {
    const jobID = path.basename(filePath).split(".")[0];
    const inputPath = path.join(dirInputs, `${jobID}.txt`);
    fs.writeFileSync(inputPath, input);
    return inputPath;
};

// Function to execute code based on language
const executeCode = (filePath, language, inputPath) => {
    const jobID = path.basename(filePath).split(".")[0];
    const outputFilePath = path.join(dirOutputs, `${jobID}`);

    return new Promise((resolve, reject) => {
        let command;
        switch (language) {
            case "cpp":
                command = `g++ ${filePath} -o ${outputFilePath}.exe && cd ${dirOutputs} && .\\${jobID}.exe < ${inputPath}`;
                break;
            case "java":
                command = `javac ${filePath} && java -cp ${path.dirname(filePath)} ${path.basename(filePath, '.java')} < ${inputPath}`;
                break;
            case "python":
                command = `python ${filePath} < ${inputPath}`;
                break;
            case "javascript":
                command = `node ${filePath} < ${inputPath}`;
                break;
            default:
                reject(new Error("Unsupported language"));
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({ type: "runtime", error, stderr });
            } else if (stderr) {
                reject({ type: "compilation", error: stderr });
            } else {
                resolve(stdout);
            }
        });
    });
};

// Route to run code
router.post("/run", authenticate, async (req, res) => {
    const { language, code, input } = req.body;
    if (!code) {
        return res.status(400).json({ success: false, error: "Empty code!" });
    }

    const languageMap = {
        cpp: "cpp",
        java: "java",
        python: "py",
        javascript: "js",
    };

    const format = languageMap[language];
    if (!format) {
        return res.status(400).json({ success: false, error: "Unsupported language!" });
    }

    try {
        const filePath = await generateFile(format, code);
        const inputPath = await generateInputFile(filePath, input);

        // Execute code and handle errors
        try {
            const output = await executeCode(filePath, language, inputPath);
            res.status(200).json({ success: true, output: output });
        } catch (error) {
            if (error.type === "compilation") {
                res.status(400).json({ success: false, error: "Compilation Error", message: error.error });
            } else if (error.type === "runtime") {
                res.status(400).json({ success: false, error: "Runtime Error", message: error.error.message, stderr: error.stderr });
            } else {
                res.status(500).json({ success: false, message: "Failed to execute code!", error: error });
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to execute code!", error: error });
    }
});

// Route to submit code with test cases
router.post("/submit/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    const { language, code, problem } = req.body;
    const user = await User.findById(req.user.id);

    if (!code) {
        return res.status(400).json({ success: false, error: "Empty code!" });
    }

    const languageMap = {
        cpp: "cpp",
        java: "java",
        python: "py",
        javascript: "js",
    };

    const format = languageMap[language];
    if (!format) {
        return res.status(400).json({ success: false, error: "Unsupported language!" });
    }

    try {
        const testCases = problem.testCases;

        const filePath = await generateFile(format, code);

        for (let i = 0; i < testCases.length; i++) {
            const inputPath = await generateInputFile(filePath, testCases[i].input);
            let output;
            try {
                output = await executeCode(filePath, language, inputPath);
            } catch (error) {
                if (error.type === "runtime") {
                    await Problem.findByIdAndUpdate(id, {
                        $push: {
                            submissions: {
                                user: user.username,
                                result: "Runtime Error",
                                language,
                                code,
                                submissionDate: Date.now()
                            },
                        },
                    });
                    return res.status(200).json({
                        success: false,
                        status: `Runtime Error on testcase ${i + 1}`,
                        error: error.error.message,
                        stderr: error.stderr,
                    });
                } else if (error.type === "compilation") {
                    await Problem.findByIdAndUpdate(id, {
                        $push: {
                            submissions: {
                                user: user.username,
                                result: "Compilation Error",
                                language,
                                code,
                                submissionDate: Date.now()
                            },
                        },
                    });
                    return res.status(200).json({
                        success: false,
                        status: "Compilation Error",
                        error: error.error,
                    });
                } else {
                    await Problem.findByIdAndUpdate(id, {
                        $push: {
                            submissions: {
                                user: user.username,
                                result: "Execution Error",
                                language,
                                code,
                                submissionDate: Date.now()
                            },
                        },
                    });
                    return res.status(500).json({
                        success: false,
                        message: "Failed to execute code!",
                        error: error,
                    });
                }
            }

            if (output.trim() !== testCases[i].output.trim()) {
                await Problem.findByIdAndUpdate(id, {
                    $push: {
                        submissions: {
                            user: user.username,
                            result: `WA on testcase ${i + 1}`,
                            language,
                            code,
                            submissionDate: Date.now()
                        },
                    },
                });
                return res.status(200).json({
                    success: false,
                    status: `WA on testcase ${i + 1}`,
                    output: output.trim(),
                    expected: testCases[i].output.trim(),
                });
            }
        }

        // If all the test cases pass
        // Check if the problem is already in the user's solvedProblems list
        const isProblemSolved = user.solvedProblems.some(
            solvedProblem => solvedProblem.problemID.toString() === id.toString()
        );

        if (!isProblemSolved) {
            // If the problem is not already in the solvedProblems list, add it
            await User.findByIdAndUpdate(req.user.id, {
                $push: {
                    solvedProblems: {
                        problemID: id,
                        language,
                        submissionDate: Date.now()
                    },
                },
            });
        }

        // Add the successful submission to the problem's submissions list
        await Problem.findByIdAndUpdate(id, {
            $push: {
                submissions: {
                    user: user.username,
                    result: "Accepted",
                    language,
                    code,
                    submissionDate: Date.now()
                },
            },
            $inc: {
                acceptedCount: 1
            }
        });

        res.status(200).json({ success: true, status: "Accepted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to submit code!", error: error });
        console.log(error);
    }
});

export default router;
