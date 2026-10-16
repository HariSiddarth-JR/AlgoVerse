const { OAuth2Client } = require("google-auth-library");

let client = null;

function getOAuthClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        return null;
    }
    if (!client) {
        client = new OAuth2Client(clientId);
    }
    return client;
}

function isGoogleAuthAvailable() {
    return Boolean(process.env.GOOGLE_CLIENT_ID);
}

async function verifyGoogleIdToken(idToken) {
    if (!idToken || typeof idToken !== "string") {
        const err = new Error("Google credential token is missing or invalid");
        err.statusCode = 400;
        throw err;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        const err = new Error("GOOGLE_CLIENT_ID is not configured in server/.env");
        err.code = "GOOGLE_OAUTH_NOT_CONFIGURED";
        err.statusCode = 503;
        throw err;
    }

    const oauthClient = getOAuthClient();

    try {
        const ticket = await oauthClient.verifyIdToken({
            idToken,
            audience: clientId,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            const err = new Error("Invalid Google token payload");
            err.statusCode = 401;
            throw err;
        }

        return {
            googleId: payload.sub,
            email: payload.email ? payload.email.toLowerCase().trim() : null,
            isEmailVerified: Boolean(payload.email_verified),
            name: payload.name || "Google User",
            avatar: payload.picture || "",
        };
    } catch (error) {
        if (error.statusCode) throw error;

        const err = new Error(`Google token verification failed: ${error.message}`);
        err.statusCode = 401;
        throw err;
    }
}

module.exports = {
    verifyGoogleIdToken,
    isGoogleAuthAvailable,
};
