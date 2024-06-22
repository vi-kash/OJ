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

// edit problem route
router.put("/editProblem/:id", authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            inputFormat,
            outputFormat,
            constraints,
            sampleInput,
            sampleOutput,
            difficulty,
            testCases
        } = req.body;

        // Find the problem by ID and update it
        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            {
                title,
                description,
                inputFormat,
                outputFormat,
                constraints,
                sampleInput,
                sampleOutput,
                difficulty,
                testCases,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedProblem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ message: "Problem updated successfully", problem: updatedProblem });
    } catch (error) {
        res.status(500).json({ message: "Failed to update problem, error occurred: ", error: error.message });
    }
});

// delete problem route
router.delete("/deleteProblem/:id", authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the problem by ID and delete it
        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deletedProblem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ message: "Problem deleted successfully" });
    } catch (error) {
        res.status(500).json({message: "Failed to delete problem, error occurred: ", error: error.message });
    }
});


export default router;
