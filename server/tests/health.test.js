process.env.NODE_ENV = "test";
const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const { app } = require("../src/app");
const { connectDB, disconnectDB } = require("../src/config/db");

test("API Health and Database Status Endpoints", async (t) => {
    t.before(async () => {
        await connectDB({ allowFallback: true, timeoutMs: 1000 });
    });

    t.after(async () => {
        await disconnectDB();
    });

    await t.test("GET / returns 200 with API info", async () => {
        const res = await request(app).get("/");
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.version, "2.0.0");
    });

    await t.test("GET /api/health returns 200 with database status", async () => {
        const res = await request(app).get("/api/health");
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.status, "healthy");
        assert.strictEqual(res.body.database.connected, true);
        assert.ok(["atlas", "local-fallback"].includes(res.body.database.provider));
    });

    await t.test("GET /api/db-status returns database metadata without credentials", async () => {
        const res = await request(app).get("/api/db-status");
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.database.connected, true);
        assert.strictEqual(res.body.database.password, undefined);
        assert.strictEqual(res.body.database.uri, undefined);
    });

    await t.test("GET /api/nonexistent-route returns 404", async () => {
        const res = await request(app).get("/api/nonexistent-route");
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.success, false);
    });
});
