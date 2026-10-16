const Progress = require("../models/Progress");
const {
    isValidAlgorithmId,
    normalizeAlgorithmId,
    getAlgorithmCategory,
    VALID_ALGORITHM_IDS,
} = require("../constants/algorithms");

// @desc    Get all progress records and learning summary for authenticated user
// @route   GET /api/progress
// @access  Protected
async function getAllProgress(req, res) {
    try {
        const userId = req.user._id;
        const progressList = await Progress.find({ userId }).sort({ updatedAt: -1 });

        const completedCount = progressList.filter((p) => p.status === "completed").length;
        const inProgressCount = progressList.filter((p) => p.status === "in-progress").length;
        const totalTimeSpent = progressList.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
        const totalVisualizations = progressList.reduce((acc, curr) => acc + (curr.visualizedCount || 0), 0);

        res.json({
            success: true,
            count: progressList.length,
            totalAlgorithms: VALID_ALGORITHM_IDS.length,
            stats: {
                completed: completedCount,
                inProgress: inProgressCount,
                notStarted: Math.max(0, VALID_ALGORITHM_IDS.length - progressList.length),
                totalTimeSpentSeconds: totalTimeSpent,
                totalVisualizations,
            },
            progress: progressList,
        });
    } catch (error) {
        console.error("[PROGRESS GET ALL ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve learning progress.",
        });
    }
}

// @desc    Get progress for a specific algorithm
// @route   GET /api/progress/:algorithmId
// @access  Protected
async function getProgressByAlgorithm(req, res) {
    try {
        const { algorithmId } = req.params;

        if (!isValidAlgorithmId(algorithmId)) {
            return res.status(400).json({
                success: false,
                error: `'${algorithmId}' is not a recognized algorithm identifier.`,
            });
        }

        const normId = normalizeAlgorithmId(algorithmId);

        const progress = await Progress.findOne({
            userId: req.user._id,
            algorithmId: { $in: [normId, algorithmId] },
        });

        res.json({
            success: true,
            progress: progress || null,
        });
    } catch (error) {
        console.error("[PROGRESS GET ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve algorithm progress.",
        });
    }
}

// @desc    Update or create (upsert) progress for an algorithm
// @route   POST /api/progress/:algorithmId
// @access  Protected
async function updateProgress(req, res) {
    try {
        const { algorithmId } = req.params;
        const { status, timeSpentSeconds, lastStepIndex, incrementVisualized } = req.body;

        if (!isValidAlgorithmId(algorithmId)) {
            return res.status(400).json({
                success: false,
                error: `'${algorithmId}' is not a recognized algorithm identifier.`,
            });
        }

        const normId = normalizeAlgorithmId(algorithmId);

        if (status && !["not-started", "in-progress", "completed"].includes(status)) {
            return res.status(400).json({
                success: false,
                error: "Invalid status. Allowed values: 'not-started', 'in-progress', 'completed'.",
            });
        }

        const updateOps = {
            $set: {
                lastVisualizedAt: new Date(),
                category: getAlgorithmCategory(normId),
            },
            $setOnInsert: {
                userId: req.user._id,
                algorithmId: normId,
            },
        };

        if (status) {
            updateOps.$set.status = status;
        }

        if (typeof lastStepIndex === "number" && lastStepIndex >= 0) {
            updateOps.$set.lastStepIndex = lastStepIndex;
        }

        const increments = {};
        if (incrementVisualized) {
            increments.visualizedCount = 1;
        }
        if (typeof timeSpentSeconds === "number" && timeSpentSeconds > 0) {
            increments.timeSpentSeconds = Math.round(timeSpentSeconds);
        }

        if (Object.keys(increments).length > 0) {
            updateOps.$inc = increments;
        }

        const progress = await Progress.findOneAndUpdate(
            { userId: req.user._id, algorithmId: { $in: [normId, algorithmId] } },
            updateOps,
            { upsert: true, returnDocument: "after", runValidators: true }
        );

        res.json({
            success: true,
            message: "Progress updated successfully.",
            progress,
        });
    } catch (error) {
        console.error("[PROGRESS UPDATE ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to update algorithm progress.",
        });
    }
}

module.exports = {
    getAllProgress,
    getProgressByAlgorithm,
    updateProgress,
};
