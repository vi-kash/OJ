import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Leaderboard", leaderboardSchema);
