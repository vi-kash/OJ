import dotenv from "dotenv";
dotenv.config();
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
const generateInputFile = async (filePath, input, index) => {
    const jobID = path.basename(filePath).split(".")[0];
    const inputPath = path.join(dirInputs, `${jobID}_${index}.txt`);
    fs.writeFileSync(inputPath, input);
    return inputPath;
};

// Function to extract the public class name from a Java file
const extractPublicClassName = (filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const match = fileContent.match(/public\s+class\s+(\w+)/);
    if (match) {
        return match[1];
    } else {
        throw new Error("No public class found in the Java file");
    }
};

// Function to execute code based on language
const executeCode = (filePath, language, inputPath, timeLimit = 5, memoryLimit = "256m") => {
    return new Promise((resolve, reject) => {
        let command;
        const BASE_URL = process.env.AWS_BASE_URL;
        switch (language) {
            case "cpp":
                command = `docker run --rm --memory=${memoryLimit} --cpus=1 --ulimit cpu=${timeLimit} --volume ${filePath}:/code/code.cpp --volume ${inputPath}:/input.txt ${BASE_URL}/cpp-docker:latest sh -c "g++ /code/code.cpp -o /code/code.out && /code/code.out < /input.txt"`;
                break;
            case "java":
                command = `docker run --rm --memory=${memoryLimit} --cpus=1 --ulimit cpu=${timeLimit} --volume ${filePath}:/code/Main.java --volume ${inputPath}:/input.txt ${BASE_URL}/java-docker:latest sh -c "javac /code/Main.java && java -cp /code Main < /input.txt"`;
                break;
            case "python":
                command = `docker run --rm --memory=${memoryLimit} --cpus=1 --ulimit cpu=${timeLimit} --volume ${filePath}:/code/code.py --volume ${inputPath}:/code/input.txt ${BASE_URL}/python-docker:latest`;
                break;
            case "javascript":
                command = `docker run --rm --memory=${memoryLimit} --cpus=1 --ulimit cpu=${timeLimit} --volume ${filePath}:/code/code.js --volume ${inputPath}:/code/input.txt ${BASE_URL}/node-docker:latest`;
                break;
            default:
                reject(new Error("Unsupported language"));
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                if (error.code === 1) {
                    reject({ type: "compilation", stderr });
                } else if (error.code === 137) {
                    reject({ type: "TLE", stderr });
                } else if (error.code === 139) {
                    reject({ type: "MLE", stderr });
                } else {
                    reject({ type: "runtime", stderr });
                }
            } else {
                resolve(stdout);
            }
        });
    });
};

// Function to clean up old files
const cleanupFiles = () => {
    const files = fs.readdirSync(dirCodes);
    files.forEach(file => {
        const filePath = path.join(dirCodes, file);
        fs.unlinkSync(filePath);
    });

    const inputFiles = fs.readdirSync(dirInputs);
    inputFiles.forEach(file => {
        const filePath = path.join(dirInputs, file);
        fs.unlinkSync(filePath);
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
        let finalFilePath = filePath;

        if (language === "java") {
            // Extract the public class name and rename the file
            const publicClassName = extractPublicClassName(filePath);
            finalFilePath = path.join(path.dirname(filePath), `${publicClassName}.java`);
            fs.renameSync(filePath, finalFilePath);
        }

        const inputPath = await generateInputFile(filePath, input, 0);

        // Execute code and handle errors
        try {
            const output = await executeCode(finalFilePath, language, inputPath);
            res.status(200).json({ success: true, result: output, message: "Successfully executed" });

            cleanupFiles();
        } catch (error) {
            if (error.type === "compilation") {
                res.status(200).json({ success: false, result: "Compilation Error", message: error.stderr });
            } else if (error.type === "TLE") {
                res.status(200).json({ success: false, result: "Time Limit Exceeded", message: error.stderr });
            } else if (error.type === "MLE") {
                res.status(200).json({ success: false, result: "Memory Limit Exceeded", message: error.stderr });
            } else if (error.type === "runtime") {
                res.status(200).json({ success: false, result: "Runtime Error", message: error.stderr });
            } else {
                res.status(500).json({ success: false, result: "Internal Server Error", message: "Failed to execute code!" });
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, result: "Internal Server Error", message: "Failed to execute code!" });
    } finally {
        cleanupFiles();
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
        let finalFilePath = filePath;

        if (language === "java") {
            // Extract the public class name and rename the file
            const publicClassName = extractPublicClassName(filePath);
            finalFilePath = path.join(path.dirname(filePath), `${publicClassName}.java`);
            fs.renameSync(filePath, finalFilePath);
        }

        for (let i = 0; i < testCases.length; i++) {
            const inputPath = await generateInputFile(filePath, testCases[i].input, i);
            let output;
            try {
                output = await executeCode(finalFilePath, language, inputPath);
            } catch (error) {
                if (error.type === "compilation") {
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
                        result: "Compilation error",
                        message: error.stderr,
                    });
                } else if (error.type === "TLE") {
                    await Problem.findByIdAndUpdate(id, {
                        $push: {
                            submissions: {
                                user: user.username,
                                result: `Time Limit Exceeded on testcase ${i + 1}`,
                                language,
                                code,
                                submissionDate: Date.now()
                            },
                        },
                    });
                    return res.status(200).json({
                        success: false,
                        result: `Time Limit Exceeded on testcase ${i + 1}`,
                        message: error.stderr,
                    });
                } else if (error.type === "MLE") {
                    await Problem.findByIdAndUpdate(id, {
                        $push: {
                            submissions: {
                                user: user.username,
                                result: `Memory Limit Exceeded on testcase ${i + 1}`,
                                language,
                                code,
                                submissionDate: Date.now()
                            },
                        },
                    });
                    return res.status(200).json({
                        success: false,
                        result: `Memory Limit Exceeded on testcase ${i + 1}`,
                        message: error.stderr,
                    });
                } else if (error.type === "runtime") {
                    await Problem.findByIdAndUpdate(id, {
                        $push: {
                            submissions: {
                                user: user.username,
                                result: `Runtime error on testcase ${i + 1}`,
                                language,
                                code,
                                submissionDate: Date.now()
                            },
                        },
                    });
                    return res.status(200).json({
                        success: false,
                        result: `Runtime error on testcase ${i + 1}`,
                        message: error.stderr,
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        result: "Internal Server Error",
                        message: `Failed to execute code on testcase ${i + 1}`
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
                    result: `Wrong Answer on testcase ${i + 1}`,
                    message: `Expected Output:\n${testCases[i].output.trim()}\nYour Output:\n${output.trim()}`,
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

        res.status(200).json({ success: true, result: "Accepted", message: "All test cases passed." });
    } catch (error) {
        res.status(500).json({ success: false, result: "Internal Server Error", message: "Failed to submit code!" });
    } finally {
        cleanupFiles();
    }
});

export default router;
