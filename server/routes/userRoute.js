import express from "express";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import Contest from "../models/Contest.js";
import { authenticate } from "../middlewares/requireAuth.js";

const router = express.Router();

router.get("/me", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetching solved problems details
        const solvedProblems = await Promise.all(
            user.solvedProblems.map(async (problem) => {
                const problemDetails = await Problem.findById(problem.problemID);
                return {
                    id: problem.problemID,
                    title: problemDetails?.title || 'Unknown',
                    difficulty: problemDetails?.difficulty || 'Unknown'
                };
            })
        );

        // Fetching contest participation details
        const participatedContests = await Promise.all(
            user.participationHistory.map(async (contest) => {
                const contestDetails = await Contest.findById(contest.contestId);
                return {
                    id: contest.contestId,
                    title: contestDetails?.title || 'Unknown',
                    score: contest.score,
                    rank: contest.rank,
                    submissionDate: contest.submissionDate,
                };
            })
        );

        res.json({
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            problems: solvedProblems,
            contests: participatedContests,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user data", error: error.message });
    }
});

export default router;
