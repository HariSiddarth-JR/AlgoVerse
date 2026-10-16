const mongoose = require("mongoose");
const { VALID_ALGORITHM_IDS } = require("../constants/algorithms");

const quizAttemptSchema = new mongoose.Schema(
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
                values: [...VALID_ALGORITHM_IDS, "general-sorting", "general-searching"],
                message: "{VALUE} is not a valid quiz algorithm ID",
            },
        },
        answers: [
            {
                questionId: {
                    type: String,
                    required: true,
                },
                selectedOption: {
                    type: Number,
                    required: true,
                },
                isCorrect: {
                    type: Boolean,
                    required: true,
                },
            },
        ],
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        totalQuestions: {
            type: Number,
            required: true,
            min: 1,
        },
        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        passed: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

quizAttemptSchema.index({ userId: 1, createdAt: -1 });

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = QuizAttempt;
