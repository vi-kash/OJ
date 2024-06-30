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

const executeCode = (filePath) => {
    const jobID = path.basename(filePath).split(".")[0];
    const outputFilePath = path.join(outputPath, `${jobID}.exe`);

    return new Promise((resolve, reject) => {
        exec(
            `g++ ${filePath} -o ${outputFilePath} && cd ${outputPath} && .\\${jobID}.exe`,
            (error, stdout, stderr) => {
                if (error) {
                    reject({ error, stderr });
                }
                if (stderr) {
                    reject(stderr);
                }
                resolve(stdout);
            }
        );
    });
};

router.post("/run", authenticate, async (req, res) => {
    const { language, code } = req.body;
    if (code === undefined) {
        return res.status(400).json({ success: false, error: "Empty code!" });
    }

    try {
        const filePath = await generateFile(language, code);
        const output = await executeCode(filePath);
        res.status(200).json({ success: true, output: output });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to execute code!", error: error.message });
    }
});

export default router;