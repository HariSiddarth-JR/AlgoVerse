const Bookmark = require("../models/Bookmark");
const {
    isValidAlgorithmId,
    normalizeAlgorithmId,
    getAlgorithmCategory,
    getAlgorithmTitle,
} = require("../constants/algorithms");

// @desc    Get all bookmarks for the authenticated user
// @route   GET /api/bookmarks
// @access  Protected
async function getBookmarks(req, res) {
    try {
        const userId = req.user._id;
        const bookmarks = await Bookmark.find({ userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookmarks.length,
            bookmarks,
        });
    } catch (error) {
        console.error("[BOOKMARKS GET ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve bookmarks.",
        });
    }
}

// @desc    Check if a specific algorithm is bookmarked
// @route   GET /api/bookmarks/check/:algorithmId
// @access  Protected
async function checkBookmark(req, res) {
    try {
        const { algorithmId } = req.params;

        if (!isValidAlgorithmId(algorithmId)) {
            return res.status(400).json({
                success: false,
                error: `'${algorithmId}' is not a recognized algorithm identifier.`,
            });
        }

        const normId = normalizeAlgorithmId(algorithmId);

        const exists = await Bookmark.exists({
            userId: req.user._id,
            algorithmId: { $in: [normId, algorithmId] },
        });

        res.json({
            success: true,
            algorithmId: normId,
            isBookmarked: Boolean(exists),
        });
    } catch (error) {
        console.error("[BOOKMARK CHECK ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to check bookmark status.",
        });
    }
}

// @desc    Create a new bookmark
// @route   POST /api/bookmarks
// @access  Protected
async function createBookmark(req, res) {
    try {
        const { algorithmId, notes } = req.body;

        if (!algorithmId || !isValidAlgorithmId(algorithmId)) {
            return res.status(400).json({
                success: false,
                error: `'${algorithmId}' is not a recognized algorithm identifier.`,
            });
        }

        const normId = normalizeAlgorithmId(algorithmId);

        const existing = await Bookmark.findOne({
            userId: req.user._id,
            algorithmId: { $in: [normId, algorithmId] },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                error: "This algorithm is already in your bookmarks.",
                bookmark: existing,
            });
        }

        const bookmark = await Bookmark.create({
            userId: req.user._id,
            algorithmId: normId,
            title: getAlgorithmTitle(normId),
            category: getAlgorithmCategory(normId),
            notes: typeof notes === "string" ? notes.trim() : "",
        });

        res.status(201).json({
            success: true,
            message: "Algorithm bookmarked successfully.",
            bookmark,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: "This algorithm is already in your bookmarks.",
            });
        }
        console.error("[BOOKMARK CREATE ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to create bookmark.",
        });
    }
}

// @desc    Delete a bookmark by algorithmId
// @route   DELETE /api/bookmarks/:algorithmId
// @access  Protected
async function deleteBookmark(req, res) {
    try {
        const { algorithmId } = req.params;

        if (!isValidAlgorithmId(algorithmId)) {
            return res.status(400).json({
                success: false,
                error: `'${algorithmId}' is not a recognized algorithm identifier.`,
            });
        }

        const normId = normalizeAlgorithmId(algorithmId);

        const deleted = await Bookmark.findOneAndDelete({
            userId: req.user._id,
            algorithmId: { $in: [normId, algorithmId] },
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: "Bookmark not found.",
            });
        }

        res.json({
            success: true,
            message: "Bookmark removed successfully.",
            algorithmId: normId,
        });
    } catch (error) {
        console.error("[BOOKMARK DELETE ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to delete bookmark.",
        });
    }
}

module.exports = {
    getBookmarks,
    checkBookmark,
    createBookmark,
    deleteBookmark,
};
