import express from "express";
import { authenticate } from "../middlewares/requireAuth.js";
import fs from "fs";
import path, { dirname } from "path";
import { v4 as uuid } from "uuid";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = express.Router();

export const dirCodes = path.join(__dirname, "..", "programFiles", "codes");

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

const outputPath = path.join(__dirname, "..", "programFiles", "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCode = (filePath, language) => {
    const jobID = path.basename(filePath).split(".")[0];
    const outputFilePath = path.join(outputPath, `${jobID}`);

    return new Promise((resolve, reject) => {
        let command;
        switch (language) {
            case "cpp":
                command = `g++ ${filePath} -o ${outputFilePath}.exe && cd ${outputPath} && .\\${jobID}.exe`;
                break;
            case "java":
                command = `javac ${filePath} && java -cp ${path.dirname(filePath)} ${path.basename(filePath, '.java')}`;
                break;
            case "python":
                command = `python ${filePath}`;
                break;
            case "javascript":
                command = `node ${filePath}`;
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
    const { language, code } = req.body;
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
        const output = await executeCode(filePath, language);
        res.status(200).json({ success: true, output: output });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to execute code!", error: error.message });
    }
});

export default router;
