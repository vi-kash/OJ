import express from "express";
import User from "../models/User.js";
import { authenticate } from "../middlewares/requireAuth.js";

const router = express.Router();

router.get("/me", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("solvedProblems.problemID", "title") // Populate problem titles
            .populate("participationHistory.contestId", "name"); // Populate contest names
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            solvedQuestions: user.solvedProblems.map(problem => ({
                id: problem.problemID._id,
                title: problem.problemID.title,
            })),
            contests: user.participationHistory.map(contest => ({
                id: contest.contestId._id,
                name: contest.contestId.name,
                score: contest.score,
                rank: contest.rank,
                submissionDate: contest.submissionDate,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user data", error: error.message });
    }
});

export default router;
