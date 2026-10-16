const mongoose = require("mongoose");
const { VALID_ALGORITHM_IDS, getAlgorithmCategory } = require("../constants/algorithms");

const progressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        algorithmId: {
            type: String,
            required: [true, "Algorithm ID is required"],
            enum: {
                values: VALID_ALGORITHM_IDS,
                message: "{VALUE} is not a valid algorithm ID",
            },
        },
        category: {
            type: String,
            enum: ["sorting", "searching", "general"],
            default: function () {
                return getAlgorithmCategory(this.algorithmId);
            },
        },
        status: {
            type: String,
            enum: ["not-started", "in-progress", "completed"],
            default: "in-progress",
        },
        visualizedCount: {
            type: Number,
            default: 1,
            min: [0, "Visualized count cannot be negative"],
        },
        timeSpentSeconds: {
            type: Number,
            default: 0,
            min: [0, "Time spent cannot be negative"],
        },
        lastStepIndex: {
            type: Number,
            default: 0,
            min: [0, "Step index cannot be negative"],
        },
        lastVisualizedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to guarantee one progress document per user per algorithm
progressSchema.index({ userId: 1, algorithmId: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;
