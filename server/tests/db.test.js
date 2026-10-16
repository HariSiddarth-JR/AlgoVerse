process.env.NODE_ENV = "test";
const test = require("node:test");
const assert = require("node:assert");
const { connectDB, getDBStatus, disconnectDB, parseDiagnosticError } = require("../src/config/db");

test("Database Diagnostics - Error Parsing", async (t) => {
    await t.test("identifies SSL Alert 80 as IP Access / Network Access rejection", () => {
        const fakeErr = new Error("SSL routines:ssl3_read_bytes:tlsv1 alert internal error: SSL alert number 80");
        const parsed = parseDiagnosticError(fakeErr);
        assert.strictEqual(parsed.type, "ATLAS_NETWORK_ACCESS_REJECTED");
        assert.ok(parsed.remediation.includes("Network Access"));
    });

    await t.test("identifies authentication failures", () => {
        const fakeErr = new Error("bad auth : AuthenticationFailed: invalid password");
        fakeErr.code = 18;
        const parsed = parseDiagnosticError(fakeErr);
        assert.strictEqual(parsed.type, "ATLAS_AUTHENTICATION_FAILED");
        assert.ok(parsed.remediation.includes("Database Access"));
    });

    await t.test("identifies DNS SRV lookup errors", () => {
        const fakeErr = new Error("querySrv ENOTFOUND _mongodb._tcp.cluster0.uieadob.mongodb.net");
        const parsed = parseDiagnosticError(fakeErr);
        assert.strictEqual(parsed.type, "ATLAS_DNS_SRV_FAILED");
    });

    await t.test("identifies timeouts", () => {
        const fakeErr = new Error("Server selection timed out after 5000 ms");
        const parsed = parseDiagnosticError(fakeErr);
        assert.strictEqual(parsed.type, "ATLAS_CONNECTION_TIMEOUT");
    });
});

test("Database Connectivity - Local In-Memory Fallback", async (t) => {
    t.after(async () => {
        await disconnectDB();
    });

    await t.test("connects to in-memory fallback when requested", async () => {
        // Disconnect any existing
        await disconnectDB();
        assert.strictEqual(getDBStatus().connected, false);

        // Connect with fallback
        const status = await connectDB({ allowFallback: true, timeoutMs: 1000 });
        assert.strictEqual(status.connected, true);
        assert.strictEqual(status.provider, "local-fallback");
        assert.ok(status.host.includes("in-memory"));

        const liveStatus = getDBStatus();
        assert.strictEqual(liveStatus.connected, true);
        assert.strictEqual(liveStatus.provider, "local-fallback");
    });

    await t.test("disconnects cleanly", async () => {
        await disconnectDB();
        const status = getDBStatus();
        assert.strictEqual(status.connected, false);
        assert.strictEqual(status.provider, "disconnected");
    });
});
