process.env.NODE_ENV = "test";
const test = require("node:test");
const assert = require("node:assert");
const { connectDB, disconnectDB } = require("../src/config/db");

test("Production Safety Guard & Test Database Isolation", async (t) => {
    const originalProdUri = process.env.MONGODB_URI;

    t.after(async () => {
        process.env.NODE_ENV = "test";
        if (originalProdUri) process.env.MONGODB_URI = originalProdUri;
        delete process.env.MONGODB_TEST_URI;
        await disconnectDB();
    });

    await t.test("automatically routes test environment to isolated in-memory MongoMemoryServer", async () => {
        await disconnectDB();
        process.env.NODE_ENV = "test";
        delete process.env.MONGODB_TEST_URI;

        const status = await connectDB();
        assert.strictEqual(status.connected, true);
        assert.strictEqual(status.provider, "local-fallback");
        assert.ok(status.host.includes("in-memory") || status.host.includes("localhost"));
        assert.notStrictEqual(status.provider, "atlas");
    });

    await t.test("fails closed if MONGODB_TEST_URI matches production MONGODB_URI", async () => {
        await disconnectDB();
        process.env.NODE_ENV = "test";
        process.env.MONGODB_URI = "mongodb+srv://user:pass@cluster.mongodb.net/production_db";
        process.env.MONGODB_TEST_URI = "mongodb+srv://user:pass@cluster.mongodb.net/production_db";

        await assert.rejects(
            async () => {
                await connectDB();
            },
            {
                message: /PRODUCTION_SAFETY_GUARD/,
            }
        );

        delete process.env.MONGODB_TEST_URI;
        if (originalProdUri) process.env.MONGODB_URI = originalProdUri;
    });
});
