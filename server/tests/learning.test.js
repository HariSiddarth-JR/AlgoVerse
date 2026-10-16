process.env.NODE_ENV = "test";
const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const { app } = require("../src/app");
const { connectDB, disconnectDB } = require("../src/config/db");
const User = require("../src/models/User");
const Progress = require("../src/models/Progress");
const Bookmark = require("../src/models/Bookmark");
const QuizAttempt = require("../src/models/QuizAttempt");
const { signToken } = require("../src/utils/token");

test("Learning APIs & Data Isolation Test Suite", async (t) => {
    let user1 = null;
    let user2 = null;
    let user1Cookie = null;
    let user2Cookie = null;

    t.before(async () => {
        process.env.NODE_ENV = "test";
        await connectDB({ allowFallback: true, timeoutMs: 1000 });
        await User.deleteMany({});
        await Progress.deleteMany({});
        await Bookmark.deleteMany({});
        await QuizAttempt.deleteMany({});

        // Create two distinct users for isolation testing
        user1 = await User.create({
            name: "User One",
            email: "user1@algoverse.io",
            password: "Password123",
            authProvider: "local",
        });

        user2 = await User.create({
            name: "User Two",
            email: "user2@algoverse.io",
            password: "Password123",
            authProvider: "local",
        });

        const token1 = signToken(user1);
        const token2 = signToken(user2);
        user1Cookie = `token=${token1}`;
        user2Cookie = `token=${token2}`;
    });

    t.after(async () => {
        await User.deleteMany({});
        await Progress.deleteMany({});
        await Bookmark.deleteMany({});
        await QuizAttempt.deleteMany({});
        await disconnectDB();
    });

    await t.test("Authentication Gates on All Learning Endpoints", async (tAuth) => {
        await tAuth.test("GET /api/progress requires authentication (401)", async () => {
            const res = await request(app).get("/api/progress");
            assert.strictEqual(res.status, 401);
        });

        await tAuth.test("POST /api/progress/bubble requires authentication (401)", async () => {
            const res = await request(app).post("/api/progress/bubble").send({ status: "in-progress" });
            assert.strictEqual(res.status, 401);
        });

        await tAuth.test("GET /api/bookmarks requires authentication (401)", async () => {
            const res = await request(app).get("/api/bookmarks");
            assert.strictEqual(res.status, 401);
        });

        await tAuth.test("POST /api/bookmarks requires authentication (401)", async () => {
            const res = await request(app).post("/api/bookmarks").send({ algorithmId: "bubble" });
            assert.strictEqual(res.status, 401);
        });

        await tAuth.test("GET /api/quizzes/bubble requires authentication (401)", async () => {
            const res = await request(app).get("/api/quizzes/bubble");
            assert.strictEqual(res.status, 401);
        });

        await tAuth.test("POST /api/quizzes/bubble/submit requires authentication (401)", async () => {
            const res = await request(app).post("/api/quizzes/bubble/submit").send({ answers: [] });
            assert.strictEqual(res.status, 401);
        });
    });

    await t.test("Progress API - Tracking & Upsert", async (tProg) => {
        await tProg.test("rejects invalid algorithm identifier (400)", async () => {
            const res = await request(app)
                .post("/api/progress/nonexistent-algo")
                .set("Cookie", [user1Cookie])
                .send({ status: "in-progress" });
            assert.strictEqual(res.status, 400);
        });

        await tProg.test("creates progress record when user visualizes bubble sort", async () => {
            const res = await request(app)
                .post("/api/progress/bubble")
                .set("Cookie", [user1Cookie])
                .send({
                    status: "in-progress",
                    timeSpentSeconds: 45,
                    lastStepIndex: 12,
                    incrementVisualized: true,
                });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.progress.algorithmId, "bubble");
            assert.strictEqual(res.body.progress.status, "in-progress");
            assert.strictEqual(res.body.progress.visualizedCount, 1);
            assert.strictEqual(res.body.progress.timeSpentSeconds, 45);
        });

        await tProg.test("accurately accumulates time and visualizations on subsequent runs", async () => {
            const res = await request(app)
                .post("/api/progress/bubble")
                .set("Cookie", [user1Cookie])
                .send({
                    timeSpentSeconds: 30,
                    incrementVisualized: true,
                    lastStepIndex: 24,
                });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.progress.visualizedCount, 2);
            assert.strictEqual(res.body.progress.timeSpentSeconds, 75);
            assert.strictEqual(res.body.progress.lastStepIndex, 24);
        });

        await tProg.test("fetches all progress with summary metrics", async () => {
            const res = await request(app)
                .get("/api/progress")
                .set("Cookie", [user1Cookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.count, 1);
            assert.strictEqual(res.body.stats.inProgress, 1);
            assert.strictEqual(res.body.stats.totalTimeSpentSeconds, 75);
            assert.strictEqual(res.body.stats.totalVisualizations, 2);
        });
    });

    await t.test("Bookmarks API - CRUD & Duplicate Prevention", async (tBook) => {
        await tBook.test("creates a new bookmark for Quick Sort", async () => {
            const res = await request(app)
                .post("/api/bookmarks")
                .set("Cookie", [user1Cookie])
                .send({
                    algorithmId: "quick",
                    notes: "Review pivot selection before interviews",
                });

            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.bookmark.algorithmId, "quick");
            assert.strictEqual(res.body.bookmark.title, "Quick Sort");
            assert.strictEqual(res.body.bookmark.notes, "Review pivot selection before interviews");
        });

        await tBook.test("checks bookmark status returns isBookmarked: true", async () => {
            const res = await request(app)
                .get("/api/bookmarks/check/quick")
                .set("Cookie", [user1Cookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.isBookmarked, true);
        });

        await tBook.test("prevents duplicate bookmark creation (409 Conflict)", async () => {
            const res = await request(app)
                .post("/api/bookmarks")
                .set("Cookie", [user1Cookie])
                .send({ algorithmId: "quick" });

            assert.strictEqual(res.status, 409);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.error.includes("already in your bookmarks"));
        });

        await tBook.test("removes bookmark", async () => {
            const res = await request(app)
                .delete("/api/bookmarks/quick")
                .set("Cookie", [user1Cookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);

            // Verify status is now false
            const checkRes = await request(app)
                .get("/api/bookmarks/check/quick")
                .set("Cookie", [user1Cookie]);
            assert.strictEqual(checkRes.body.isBookmarked, false);
        });
    });

    await t.test("Quiz API - Question Delivery, Evaluation & History", async (tQuiz) => {
        await tQuiz.test("delivers client-safe questions without leaking correctOption or explanation", async () => {
            const res = await request(app)
                .get("/api/quizzes/bubble")
                .set("Cookie", [user1Cookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(res.body.questions.length > 0);

            // Ensure answer keys are stripped
            for (const q of res.body.questions) {
                assert.strictEqual(q.correctOption, undefined);
                assert.strictEqual(q.explanation, undefined);
                assert.ok(q.question);
                assert.ok(Array.isArray(q.options));
            }
        });

        await tQuiz.test("evaluates quiz submission, computes score and passes attempt", async () => {
            // bubble-q1 correct is 2, bubble-q2 correct is 1, bubble-q3 correct is 0
            const answers = [
                { questionId: "bubble-q1", selectedOption: 2 }, // correct
                { questionId: "bubble-q2", selectedOption: 1 }, // correct
                { questionId: "bubble-q3", selectedOption: 0 }, // correct
            ];

            const res = await request(app)
                .post("/api/quizzes/bubble/submit")
                .set("Cookie", [user1Cookie])
                .send({ answers });

            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.score, 3);
            assert.strictEqual(res.body.totalQuestions, 3);
            assert.strictEqual(res.body.percentage, 100);
            assert.strictEqual(res.body.passed, true);
            assert.ok(res.body.feedback.length === 3);
            assert.strictEqual(res.body.feedback[0].isCorrect, true);

            // Verify progress for bubble sort was automatically promoted to completed
            const progRes = await request(app)
                .get("/api/progress/bubble")
                .set("Cookie", [user1Cookie]);
            assert.strictEqual(progRes.body.progress.status, "completed");
        });

        await tQuiz.test("evaluates failing quiz attempt accurately", async () => {
            const answers = [
                { questionId: "bubble-q1", selectedOption: 0 }, // wrong
                { questionId: "bubble-q2", selectedOption: 0 }, // wrong
                { questionId: "bubble-q3", selectedOption: 0 }, // correct
            ];

            const res = await request(app)
                .post("/api/quizzes/bubble/submit")
                .set("Cookie", [user1Cookie])
                .send({ answers });

            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.score, 1);
            assert.strictEqual(res.body.percentage, 33);
            assert.strictEqual(res.body.passed, false);
        });

        await tQuiz.test("retrieves user quiz history in descending order", async () => {
            const res = await request(app)
                .get("/api/quizzes/history")
                .set("Cookie", [user1Cookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.count, 2);
        });

        await tQuiz.test("retrieves aggregated quiz summary statistics", async () => {
            const res = await request(app)
                .get("/api/quizzes/summary")
                .set("Cookie", [user1Cookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.summary.totalAttempts, 2);
            assert.strictEqual(res.body.summary.passedAttempts, 1);
            assert.strictEqual(res.body.summary.passRatePercentage, 50);
        });
    });

    await t.test("Tenant & Cross-User Data Isolation", async (tIso) => {
        // Setup User 1 with private bookmark and progress
        await request(app)
            .post("/api/bookmarks")
            .set("Cookie", [user1Cookie])
            .send({ algorithmId: "binary", notes: "User 1 private notes" });

        await request(app)
            .post("/api/progress/binary")
            .set("Cookie", [user1Cookie])
            .send({ status: "completed", timeSpentSeconds: 120 });

        await tIso.test("User 2 cannot see User 1 bookmarks", async () => {
            const res = await request(app)
                .get("/api/bookmarks")
                .set("Cookie", [user2Cookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.count, 0);
            assert.deepStrictEqual(res.body.bookmarks, []);
        });

        await tIso.test("User 2 check on User 1 bookmarked algorithm returns false", async () => {
            const res = await request(app)
                .get("/api/bookmarks/check/binary")
                .set("Cookie", [user2Cookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.isBookmarked, false);
        });

        await tIso.test("User 2 cannot delete User 1 bookmark (returns 404)", async () => {
            const res = await request(app)
                .delete("/api/bookmarks/binary")
                .set("Cookie", [user2Cookie]);

            assert.strictEqual(res.status, 404);

            // Verify User 1 bookmark is still intact
            const checkUser1 = await request(app)
                .get("/api/bookmarks/check/binary")
                .set("Cookie", [user1Cookie]);
            assert.strictEqual(checkUser1.body.isBookmarked, true);
        });

        await tIso.test("User 2 cannot see User 1 progress", async () => {
            const res = await request(app)
                .get("/api/progress")
                .set("Cookie", [user2Cookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.count, 0);
            assert.strictEqual(res.body.stats.completed, 0);
        });

        await tIso.test("User 2 cannot see User 1 quiz history", async () => {
            const res = await request(app)
                .get("/api/quizzes/history")
                .set("Cookie", [user2Cookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.count, 0);
        });
    });
});
