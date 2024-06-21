import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    submissionDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Accepted", "Rejected", "Pending"], default: "Pending" },
    score: Number,
    errorMessage: String
});

export default mongoose.model("Submission", submissionSchema);
