const express = require("express");
const router = express.Router();

const {
    getAllProgress,
    getProgressByAlgorithm,
    updateProgress,
} = require("../controllers/progressController");

const { protect } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimiter");

// All progress routes require authentication and are user-isolated
router.use(protect);
router.use(apiLimiter);

router.get("/", getAllProgress);
router.get("/:algorithmId", getProgressByAlgorithm);
router.post("/:algorithmId", updateProgress);

module.exports = router;
