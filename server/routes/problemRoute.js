import express from "express";
import Problem from "../models/Problem.js";
import { authenticate, authorizeAdmin } from "../middlewares/requireAuth.js"; // Middleware for authentication and authorization

const router = express.Router();

// Add problem route
router.post("/addProblem", authenticate, authorizeAdmin, async (req, res) => {
    try {
        // get all the data from the body
        const { title, description, inputFormat, outputFormat, constraints, sampleInput, sampleOutput, difficulty, testCases } = req.body;

        // Validate input
        if (!(title && description && inputFormat && outputFormat && constraints && sampleInput && sampleOutput && difficulty && Array.isArray(testCases))) {
            return res.status(400).send({ error: "Invalid input data" });
        }

        // save problem in the database
        const problem = await Problem.create({
            title,
            description,
            inputFormat,
            outputFormat,
            constraints,
            sampleInput,
            sampleOutput,
            difficulty,
            testCases
        });

        res
            .status(201)
            .json({ message: "Problem added successfully!", problem });
    } catch (error) {
        console.log("Failed to add problem, error occurred: ", error.message);
    }
});

export default router;
