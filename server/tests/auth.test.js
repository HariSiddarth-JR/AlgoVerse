process.env.NODE_ENV = "test";
const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const { app } = require("../src/app");
const { connectDB, disconnectDB } = require("../src/config/db");
const User = require("../src/models/User");
const { signToken } = require("../src/utils/token");

test("Authentication and Security Test Suite", async (t) => {
    t.before(async () => {
        process.env.NODE_ENV = "test";
        process.env.JWT_SECRET = "test_jwt_secret_key_92817346";
        await connectDB({ allowFallback: true, timeoutMs: 1000 });
        await User.deleteMany({});
    });

    t.after(async () => {
        await User.deleteMany({});
        await disconnectDB();
    });

    let authCookie = null;
    let registeredUser = null;

    await t.test("Registration Flow", async (tReg) => {
        await tReg.test("successfully registers a user with valid email and strong password", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Alice Explorer",
                    email: "Alice@AlgoVerse.io", // Test normalization to lowercase
                    password: "Password123",
                });

            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.user.name, "Alice Explorer");
            assert.strictEqual(res.body.user.email, "alice@algoverse.io");
            assert.strictEqual(res.body.user.password, undefined); // Password never leaked

            // Verify HTTP-only cookie set
            const cookies = res.headers["set-cookie"];
            assert.ok(cookies && cookies.length > 0);
            assert.ok(cookies[0].includes("token="));
            assert.ok(cookies[0].toLowerCase().includes("httponly"));

            registeredUser = res.body.user;
        });

        await tReg.test("rejects registration with empty name", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "",
                    email: "bob@algoverse.io",
                    password: "Password123",
                });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
        });

        await tReg.test("rejects registration with invalid email format", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Bob",
                    email: "invalid-email-string",
                    password: "Password123",
                });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
        });

        await tReg.test("rejects registration with weak password (< 8 chars)", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Bob",
                    email: "bob@algoverse.io",
                    password: "pass1",
                });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
        });

        await tReg.test("rejects registration with password lacking numbers", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Bob",
                    email: "bob@algoverse.io",
                    password: "onlylettersinpass",
                });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
        });

        await tReg.test("rejects duplicate email registration (case-insensitive)", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Alice Impersonator",
                    email: "ALICE@algoverse.io",
                    password: "Password999",
                });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.error.includes("already exists"));
        });
    });

    await t.test("Login Flow", async (tLogin) => {
        await tLogin.test("successfully logs in with valid credentials and sets cookie", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "alice@algoverse.io",
                    password: "Password123",
                });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.user.email, "alice@algoverse.io");
            assert.strictEqual(res.body.user.password, undefined);

            const cookies = res.headers["set-cookie"];
            assert.ok(cookies && cookies[0].includes("token="));
            authCookie = cookies[0].split(";")[0]; // "token=..."
        });

        await tLogin.test("rejects incorrect password with uniform error", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "alice@algoverse.io",
                    password: "WrongPassword999",
                });
            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.error, "Invalid email or password.");
        });

        await tLogin.test("rejects non-existent user with uniform error to prevent enumeration", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "nonexistent@algoverse.io",
                    password: "Password123",
                });
            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.error, "Invalid email or password.");
        });

        await tLogin.test("rejects missing credentials", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({});
            assert.strictEqual(res.status, 400);
        });
    });

    await t.test("Protected Routes & Session Verification", async (tProt) => {
        await tProt.test("allows access to /api/auth/me with valid session cookie", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Cookie", [authCookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.user.email, "alice@algoverse.io");
        });

        await tProt.test("allows access to /api/auth/me with Bearer token header", async () => {
            const rawToken = authCookie.replace("token=", "");
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${rawToken}`);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.user.email, "alice@algoverse.io");
        });

        await tProt.test("rejects access to /api/auth/me without token", async () => {
            const res = await request(app).get("/api/auth/me");
            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.code, "NO_TOKEN");
        });

        await tProt.test("rejects access with expired token", async () => {
            const expiredToken = signToken(registeredUser, { expiresIn: "-1s" });

            const res = await request(app)
                .get("/api/auth/me")
                .set("Cookie", [`token=${expiredToken}`]);

            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.code, "TOKEN_EXPIRED");
        });

        await tProt.test("rejects access with tampered/invalid token", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Cookie", ["token=maliciously_fabricated_token"]);

            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.code, "INVALID_TOKEN");
        });
    });

    await t.test("Logout Flow", async (tLogout) => {
        await tLogout.test("clears token cookie on logout", async () => {
            const res = await request(app)
                .post("/api/auth/logout")
                .set("Cookie", [authCookie]);

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);

            const cookies = res.headers["set-cookie"];
            assert.ok(cookies && cookies[0].includes("token=;"));
        });
    });

    await t.test("Password Reset Workflow", async (tReset) => {
        let devToken = null;

        await tReset.test("generates expiring token for existing email without leaking status", async () => {
            const res = await request(app)
                .post("/api/auth/forgot-password")
                .send({ email: "alice@algoverse.io" });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(res.body.devResetToken);
            devToken = res.body.devResetToken;
        });

        await tReset.test("returns identical message for non-existent email (anti-enumeration)", async () => {
            const res = await request(app)
                .post("/api/auth/forgot-password")
                .send({ email: "ghost@algoverse.io" });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.devResetToken, undefined); // No token returned
        });

        await tReset.test("resets password using valid token and logs user in", async () => {
            const res = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    token: devToken,
                    newPassword: "NewSecretPassword456",
                });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);

            // Verify login with new password works
            const loginRes = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "alice@algoverse.io",
                    password: "NewSecretPassword456",
                });
            assert.strictEqual(loginRes.status, 200);

            // Verify old password no longer works
            const oldLoginRes = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "alice@algoverse.io",
                    password: "Password123",
                });
            assert.strictEqual(oldLoginRes.status, 401);
        });

        await tReset.test("rejects single-use token on second attempt", async () => {
            const res = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    token: devToken,
                    newPassword: "AnotherPassword789",
                });
            assert.strictEqual(res.status, 400);
            assert.ok(res.body.error.includes("Invalid or expired"));
        });
    });

    await t.test("Google Sign-In & Account Linking Safeguards", async (tGoogle) => {
        await tGoogle.test("rejects Google auth with missing credential", async () => {
            const res = await request(app)
                .post("/api/auth/google")
                .send({});
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
        });

        await tGoogle.test("handles unconfigured Google Client ID with clear 503 error", async () => {
            delete process.env.GOOGLE_CLIENT_ID;
            const res = await request(app)
                .post("/api/auth/google")
                .send({ credential: "mock_google_id_token" });

            assert.strictEqual(res.status, 503);
            assert.strictEqual(res.body.code, "GOOGLE_OAUTH_NOT_CONFIGURED");
        });

        await tGoogle.test("rejects invalid Google token when Client ID is configured", async () => {
            process.env.GOOGLE_CLIENT_ID = "mock_client_id.apps.googleusercontent.com";
            const res = await request(app)
                .post("/api/auth/google")
                .send({ credential: "invalid_fabricated_token" });

            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.body.success, false);
        });

        await tGoogle.test("safely prevents automatic account takeover without password linking", async () => {
            // Suppose a local user alice exists. We mock verifyGoogleIdToken to simulate a Google account with alice's email.
            const googleAuthService = require("../src/services/googleAuth");
            const originalVerify = googleAuthService.verifyGoogleIdToken;

            googleAuthService.verifyGoogleIdToken = async () => ({
                googleId: "google_sub_123456789",
                email: "alice@algoverse.io",
                isEmailVerified: true,
                name: "Alice Google",
                avatar: "https://example.com/avatar.jpg",
            });

            // Attempt Google sign-in without providing linkPassword
            const resWithoutPass = await request(app)
                .post("/api/auth/google")
                .send({ credential: "valid_simulated_token" });

            assert.strictEqual(resWithoutPass.status, 409);
            assert.strictEqual(resWithoutPass.body.code, "ACCOUNT_EXISTS_WITH_PASSWORD");

            // Attempt with wrong linkPassword
            const resWrongPass = await request(app)
                .post("/api/auth/google")
                .send({
                    credential: "valid_simulated_token",
                    linkPassword: "IncorrectPassword111",
                });

            assert.strictEqual(resWrongPass.status, 401);

            // Attempt with correct linkPassword -> successfully links account
            const resCorrectPass = await request(app)
                .post("/api/auth/google")
                .send({
                    credential: "valid_simulated_token",
                    linkPassword: "NewSecretPassword456",
                });

            assert.strictEqual(resCorrectPass.status, 200);
            assert.strictEqual(resCorrectPass.body.user.authProvider, "both");

            // Restore original verify function
            googleAuthService.verifyGoogleIdToken = originalVerify;
        });
    });
});
