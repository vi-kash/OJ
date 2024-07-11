import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    inputFormat: { type: String, required: true },
    outputFormat: { type: String, required: true },
    constraints: { type: String, required: true },
    sampleInput: { type: String, required: true },
    sampleOutput: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    testCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true }
        }
    ],
    author: { type: String, required: true },
    submissions: [
        {
            user: { type: String, required: true },
            result: { type: String, required: true },
            language: { type: String, required: true },
            code: { type: String, required: true },
            submissionDate: Date
        }
    ],
    acceptedCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

problemSchema.path("submissions").default([]);

export default mongoose.model("Problem", problemSchema);
