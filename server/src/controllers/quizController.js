const QuizAttempt = require("../models/QuizAttempt");
const Progress = require("../models/Progress");
const { getQuizForAlgorithm, getRandomQuizQuestions } = require("../data/quizQuestions");
const {
    isValidAlgorithmId,
    normalizeAlgorithmId,
    getAlgorithmCategory,
} = require("../constants/algorithms");

// Cache for active quiz attempts per user and algorithm
// key: `${userId}:${normAlgoId}` -> Map<questionId, questionEvaluationObj>
const activeAttemptSessions = new Map();

// Cache for last served question IDs per user and algorithm (to prevent immediate repeat if modal reopens)
// key: `${userId}:${normAlgoId}` -> Array<questionId>
const lastServedCache = new Map();

function isAllowedQuizId(id) {
    const norm = normalizeAlgorithmId(id);
    return isValidAlgorithmId(norm) || norm === "generalsorting" || norm === "generalsearching";
}

// @desc    Get questions for an algorithm quiz (without answer keys)
// @route   GET /api/quizzes/:algorithmId
// @access  Protected
async function getQuiz(req, res) {
    try {
        const { algorithmId } = req.params;
        const normAlgoId = normalizeAlgorithmId(algorithmId);

        if (!isAllowedQuizId(normAlgoId)) {
            return res.status(400).json({
                success: false,
                error: `'${algorithmId}' is not a valid quiz identifier.`,
            });
        }

        const userId = req.user._id.toString();
        const cacheKey = `${userId}:${normAlgoId}`;

        // Find exclude IDs from last served cache or most recent attempt in DB
        let excludeIds = lastServedCache.get(cacheKey) || [];
        if (excludeIds.length === 0) {
            const lastAttempt = await QuizAttempt.findOne({ userId: req.user._id, algorithmId: normAlgoId })
                .sort({ createdAt: -1 });
            if (lastAttempt?.answers?.length) {
                excludeIds = lastAttempt.answers.map((a) => a.questionId);
            }
        }

        // Shuffle options unless in automated test mode without explicit flag
        const shouldShuffleOptions = process.env.NODE_ENV !== "test" || req.query.shuffleOptions === "true";

        const attemptQuestions = getRandomQuizQuestions(normAlgoId, {
            excludeIds,
            count: 3,
            shuffleOptions: shouldShuffleOptions,
        });

        // Store active attempt questions for evaluation on submit
        const attemptMap = new Map(attemptQuestions.map((q) => [q.id, q]));
        activeAttemptSessions.set(cacheKey, attemptMap);
        lastServedCache.set(cacheKey, attemptQuestions.map((q) => q.id));

        // Client-safe questions (strips correctOption and explanation)
        const clientQuestions = attemptQuestions.map(({ id, question, options }) => ({
            id,
            question,
            options,
        }));

        res.json({
            success: true,
            algorithmId: normAlgoId,
            totalQuestions: clientQuestions.length,
            questions: clientQuestions,
        });
    } catch (error) {
        console.error("[QUIZ GET ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to load quiz questions.",
        });
    }
}

// @desc    Submit quiz answers, compute score, and record attempt
// @route   POST /api/quizzes/:algorithmId/submit
// @access  Protected
async function submitQuiz(req, res) {
    try {
        const { algorithmId } = req.params;
        const normAlgoId = normalizeAlgorithmId(algorithmId);
        const { answers } = req.body;

        if (!isAllowedQuizId(normAlgoId)) {
            return res.status(400).json({
                success: false,
                error: `'${algorithmId}' is not a valid quiz identifier.`,
            });
        }

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Answers array is required and cannot be empty.",
            });
        }

        const userId = req.user._id.toString();
        const cacheKey = `${userId}:${normAlgoId}`;

        // Retrieve active attempt question map (with option permutations), or fallback to master bank
        const activeAttemptMap = activeAttemptSessions.get(cacheKey);
        const fullBank = getQuizForAlgorithm(normAlgoId);
        const masterMap = new Map(fullBank.map((q) => [q.id, q]));

        let score = 0;
        const evaluatedAnswers = [];
        const detailedFeedback = [];

        for (const ans of answers) {
            const question = activeAttemptMap?.get(ans.questionId) || masterMap.get(ans.questionId);
            if (!question) continue;

            const isCorrect = Number(ans.selectedOption) === question.correctOption;
            if (isCorrect) score += 1;

            evaluatedAnswers.push({
                questionId: question.id,
                selectedOption: Number(ans.selectedOption),
                isCorrect,
            });

            detailedFeedback.push({
                questionId: question.id,
                question: question.question,
                selectedOption: Number(ans.selectedOption),
                correctOption: question.correctOption,
                isCorrect,
                explanation: question.explanation,
            });
        }

        // Clean up active session upon submission
        activeAttemptSessions.delete(cacheKey);

        const totalQuestions = evaluatedAnswers.length || answers.length;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
        const passed = percentage >= 70;

        const attempt = await QuizAttempt.create({
            userId: req.user._id,
            algorithmId: normAlgoId,
            answers: evaluatedAnswers,
            score,
            totalQuestions,
            percentage,
            passed,
        });

        // If passed and it is a registered algorithm, mark progress as completed
        if (passed && isValidAlgorithmId(normAlgoId)) {
            await Progress.findOneAndUpdate(
                { userId: req.user._id, algorithmId: normAlgoId },
                {
                    $set: {
                        status: "completed",
                        lastVisualizedAt: new Date(),
                        category: getAlgorithmCategory(normAlgoId),
                    },
                    $setOnInsert: {
                        userId: req.user._id,
                        algorithmId: normAlgoId,
                    },
                },
                { upsert: true, returnDocument: "after" }
            );
        }

        res.status(201).json({
            success: true,
            attemptId: attempt._id,
            score,
            totalQuestions,
            percentage,
            passed,
            feedback: detailedFeedback,
        });
    } catch (error) {
        console.error("[QUIZ SUBMIT ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to submit quiz attempt.",
        });
    }
}

// @desc    Get user's past quiz attempts
// @route   GET /api/quizzes/history
// @access  Protected
async function getQuizHistory(req, res) {
    try {
        const userId = req.user._id;
        const history = await QuizAttempt.find({ userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: history.length,
            history,
        });
    } catch (error) {
        console.error("[QUIZ HISTORY ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve quiz history.",
        });
    }
}

// @desc    Get summary quiz statistics for dashboard
// @route   GET /api/quizzes/summary
// @access  Protected
async function getQuizSummary(req, res) {
    try {
        const userId = req.user._id;
        const attempts = await QuizAttempt.find({ userId });

        const totalAttempts = attempts.length;
        const passedAttempts = attempts.filter((a) => a.passed).length;
        const averageScore = totalAttempts > 0
            ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts)
            : 0;

        res.json({
            success: true,
            summary: {
                totalAttempts,
                passedAttempts,
                passRatePercentage: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
                averagePercentage: averageScore,
            },
        });
    } catch (error) {
        console.error("[QUIZ SUMMARY ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve quiz summary.",
        });
    }
}

module.exports = {
    getQuiz,
    submitQuiz,
    getQuizHistory,
    getQuizSummary,
};
