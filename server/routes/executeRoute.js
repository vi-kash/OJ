import express from "express";
import { authenticate } from "../middlewares/requireAuth.js";
import fs from "fs";
import path, { dirname } from "path";
import { v4 as uuid } from "uuid";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = express.Router();

const dirCodes = path.join(__dirname, "..", "programFiles", "codes");

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = async (format, content) => {
    const jobID = uuid();
    const fileName = `${jobID}.${format}`;
    const filePath = path.join(dirCodes, fileName);
    fs.writeFileSync(filePath, content);
    return filePath;
};

const dirInputs = path.join(__dirname, "..", "programFiles", "inputs");

if(!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

const generateInputFile = async (filePath, input) => {
    const jobID = path.basename(filePath).split(".")[0];
    const inputPath = path.join(dirInputs, `${jobID}.txt`);
    fs.writeFileSync(inputPath, input);
    return inputPath;
}

const outputPath = path.join(__dirname, "..", "programFiles", "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCode = (filePath, language, inputPath) => {
    const jobID = path.basename(filePath).split(".")[0];
    const outputFilePath = path.join(outputPath, `${jobID}`);

    return new Promise((resolve, reject) => {
        let command;
        switch (language) {
            case "cpp":
                command = `g++ ${filePath} -o ${outputFilePath}.exe && cd ${outputPath} && .\\${jobID}.exe < ${inputPath}`;
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
                reject({ error, stderr });
            } else if (stderr) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
};

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
        const output = await executeCode(filePath, language, inputPath);
        res.status(200).json({ success: true, output: output });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to execute code!", error: error });
    }
});

export default router;
