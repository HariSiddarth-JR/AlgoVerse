const express = require("express");
const router = express.Router();

const {
    getQuiz,
    submitQuiz,
    getQuizHistory,
    getQuizSummary,
} = require("../controllers/quizController");

const { protect } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimiter");

// All quiz routes require authentication
router.use(protect);
router.use(apiLimiter);

router.get("/history", getQuizHistory);
router.get("/summary", getQuizSummary);
router.get("/:algorithmId", getQuiz);
router.post("/:algorithmId/submit", submitQuiz);

module.exports = router;
