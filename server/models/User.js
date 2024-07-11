import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    registrationDate: { type: Date, default: Date.now },
    solvedProblems: [
        {
            problemID: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
            language: { type: String, required: true },
            submissionDate: Date
        }
    ],
    participationHistory: [
        {
            contestID: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
            score: Number,
            rank: Number,
            submissionDate: Date
        }
    ],
});

userSchema.path("solvedProblems").default([]);
userSchema.path("participationHistory").default([]);

export default mongoose.model("User", userSchema);
