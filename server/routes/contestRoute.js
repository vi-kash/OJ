import express from "express";
import Contest from "../models/Contest.js";
import { authenticate, authorizeAdmin } from "../middlewares/requireAuth.js"; // Middleware for authentication and authorization

const router = express.Router();

// create contest route
router.post("/createContest", authenticate, authorizeAdmin, async (req, res) => {
    try {
        // get all data from the body
        const { title, description, startDate, endDate, problems, participants } = req.body;
        
        // contest creator will himself be a participant
        participants.push(req.user.id);

        // validate input
        if (!(title && description && startDate && endDate && Array.isArray(problems) && Array.isArray(participants))) {
            return res.status(400).json({ error: "Please provide all required fields" });
        }

        // Create a new contest
        const newContest = await Contest.create({
            title,
            description,
            startDate,
            endDate,
            problems,
            participants
        });

        res.status(201).json({ message: "Contest created successfully", contest: newContest });
    } catch (error) {
        res.status(500).json({ message: "Failed to create contest, error occurred: ", error: error.message });
    }
});

// edit contest route
router.put("/editContest/:id", authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Add updatedAt field to track when the contest was last updated
        updates.updatedAt = Date.now();

        // Find the contest by ID and update only the provided fields
        const updatedContest = await Contest.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        if (!updatedContest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        res.status(200).json({ message: "Contest updated successfully", contest: updatedContest });
    } catch (error) {
        res.status(500).json({ message: "Failed to update contest, error occurred: ", error: error.message });
    }
});

router.delete("/deleteContest/:id", authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the contest by ID and delete it
        const deletedContest = await Contest.findByIdAndDelete(id);

        if (!deletedContest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        res.status(200).json({ message: "Contest deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
