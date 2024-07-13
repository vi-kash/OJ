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
        switch (language) {
            case "cpp":
                command = `docker run --rm --memory=${memoryLimit} --cpus=1 --ulimit cpu=${timeLimit} --volume ${filePath}:/code/code.cpp --volume ${inputPath}:/input.txt cpp-docker sh -c "g++ /code/code.cpp -o /code/code.out && /code/code.out < /input.txt"`;
                break;
            case "java":
                command = `docker run --rm --memory=${memoryLimit} --cpus=1 --ulimit cpu=${timeLimit} --volume ${filePath}:/code/Main.java --volume ${inputPath}:/input.txt java-docker sh -c "javac /code/Main.java && java -cp /code Main < /input.txt"`;
                break;
            case "python":
                command = `docker run --rm --memory=${memoryLimit} --cpus=1 --ulimit cpu=${timeLimit} --volume ${filePath}:/code/code.py --volume ${inputPath}:/code/input.txt python-docker`;
                break;
            case "javascript":
                command = `docker run --rm --memory=${memoryLimit} --cpus=1 --ulimit cpu=${timeLimit} --volume ${filePath}:/code/code.js --volume ${inputPath}:/code/input.txt node-docker`;
                break;
            default:
                reject(new Error("Unsupported language"));
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                // Check if error is due to TLE
                if (error.signal === "SIGKILL") {
                    reject({ type: "TLE", error, stderr: "Time Limit Exceeded" });
                } else {
                    reject({ type: "runtime", error, stderr });
                }
            } else if (stderr) {
                reject({ type: "compilation", error: stderr });
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
            res.status(200).json({ success: true, output: output });

            // Clean up files after execution
            cleanupFiles();
        } catch (error) {
            if (error.type === "compilation") {
                res.status(400).json({ success: false, error: "Compilation Error", message: error.error });
            } else if (error.type === "runtime") {
                res.status(400).json({ success: false, error: "Runtime Error", message: error.error.message, stderr: error.stderr });
            } else if (error.type === "TLE") {
                res.status(400).json({ success: false, error: "Time Limit Exceeded", stderr: error.stderr });
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
                if (error.type === "runtime") {
                    console.log(error);
                    await Problem.findByIdAndUpdate(id, {
                        $push: {
                            submissions: {
                                user: user.username,
                                result: `Runtime Error on testcase ${i + 1}`,
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
                        status: `Time Limit Exceeded on testcase ${i + 1}`,
                        error: error.stderr,
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
                        status: `Failed to execute code on testcase ${i + 1}`,
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
                    status: `Wrong Answer on testcase ${i + 1}`,
                    expectedOutput: testCases[i].output.trim(),
                    output: output.trim(),
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

        // Clean up files after submission
        cleanupFiles();
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to submit code!", error: error });
    }
});

export default router;
