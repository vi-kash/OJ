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
                    title: problemDetails?.title || "Unknown",
                    difficulty: problemDetails?.difficulty || "Unknown",
                    author: problemDetails?.author || "Unknown",
                    totalSubmissions: problemDetails?.submissions.length || 0,
                    acceptedCount: problemDetails?.acceptedCount || 0,
                    language: problem.language,
                    submissionDate: problem.submissionDate
                };
            })
        );

        // Fetching contest participation details
        const participatedContests = await Promise.all(
            user.participationHistory.map(async (contest) => {
                const contestDetails = await Contest.findById(contest.contestID);
                return {
                    id: contest.contestID,
                    title: contestDetails?.title || "Unknown",
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

router.post("/updateProfile", authenticate, async (req, res) => {
    const { name, username } = req.body;
    const userId = req.user.id;

    try {
        // Check if username is already taken by another user
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ success: false, message: "Username already taken" });
        }

        await User.findByIdAndUpdate(
            userId,
            { $set: { name, username } },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Profile updated successfully!" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Error in updating the profile ", error });
    }
});

router.post("/updateEmail", authenticate, async (req, res) => {
    const { email } = req.body;
    const userId = req.user.id;

    try {
        // Check if email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already in use." });
        }

        await User.findByIdAndUpdate(
            userId,
            { $set: { email } },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Email updated successfully!" });
    } catch (error) {
        console.error("Error updating email:", error);
        res.status(500).json({ message: "Error in updating the email ", error });
    }
});

export default router;
