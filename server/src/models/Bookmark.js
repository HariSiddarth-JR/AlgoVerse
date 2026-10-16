const mongoose = require("mongoose");
const { VALID_ALGORITHM_IDS, getAlgorithmCategory, getAlgorithmTitle } = require("../constants/algorithms");

const bookmarkSchema = new mongoose.Schema(
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
        title: {
            type: String,
            default: function () {
                return getAlgorithmTitle(this.algorithmId);
            },
        },
        category: {
            type: String,
            enum: ["sorting", "searching", "general"],
            default: function () {
                return getAlgorithmCategory(this.algorithmId);
            },
        },
        notes: {
            type: String,
            maxlength: [500, "Notes cannot exceed 500 characters"],
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate bookmarks for the same algorithm by the same user
bookmarkSchema.index({ userId: 1, algorithmId: 1 }, { unique: true });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

module.exports = Bookmark;
