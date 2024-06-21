import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Contest", contestSchema);
