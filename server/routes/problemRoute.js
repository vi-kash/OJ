import express from "express";
import Problem from "../models/Problem.js";
import { authenticate, authorizeAdmin } from "../middlewares/requireAuth.js"; // Middleware for authentication and authorization

const router = express.Router();

// Get problems route
router.get("/problems", authenticate, async (req, res) => {
    try {
        const problems = await Problem.find({});
        res.json({ problems: problems });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch problems", error: error.message });
    }
});

// Get a specific problem
router.get("/problem/:id", authenticate, async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        res.json({ problem: problem });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch problem", error: error.message });
    }
});

// Add problem route
router.post("/addProblem", authenticate, authorizeAdmin, async (req, res) => {
    try {
        // get all the data from the body
        const { title, description, inputFormat, outputFormat, constraints, sampleInput, sampleOutput, difficulty, testCases } = req.body;

        // validate input
        if (!(title && description && inputFormat && outputFormat && constraints && sampleInput && sampleOutput && difficulty && Array.isArray(testCases))) {
            return res.status(400).json({ error: "Please provide all required fields" });
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
        const updates = req.body;

        // Add updatedAt field to track when the problem was last updated
        updates.updatedAt = Date.now();

        // Find the problem by ID and update only the provided fields
        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        if (!updatedProblem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.status(200).json({ message: 'Problem updated successfully', problem: updatedProblem });
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
        res.status(500).json({ message: "Failed to delete problem, error occurred: ", error: error.message });
    }
});


export default router;
