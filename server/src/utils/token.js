const jwt = require("jsonwebtoken");

const DEFAULT_DEV_SECRET = "algoverse_dev_secret_key_change_in_production_389274";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const COOKIE_MAX_AGE_DAYS = 7;

function getJwtSecret() {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
        console.error("[SECURITY WARNING] JWT_SECRET is not set in production! Please configure JWT_SECRET in server/.env.");
    }
    return process.env.JWT_SECRET || DEFAULT_DEV_SECRET;
}

function signToken(user, options = {}) {
    return jwt.sign(
        {
            id: user._id ? user._id.toString() : user.id,
            email: user.email,
            role: user.role || "user",
        },
        getJwtSecret(),
        {
            expiresIn: options.expiresIn || JWT_EXPIRES_IN,
        }
    );
}

function verifyToken(token) {
    return jwt.verify(token, getJwtSecret());
}

function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        // In cross-site production deployments (Vercel frontend + Render backend),
        // sameSite must be "none" with secure: true for browsers to accept and send cookies.
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000, // 7 days in ms
        path: "/",
    };
}

function sendTokenResponse(user, statusCode, res, message = "Success") {
    const token = signToken(user);
    const cookieOptions = getCookieOptions();

    res.cookie("token", token, cookieOptions);

    res.status(statusCode).json({
        success: true,
        message,
        token,
        user: user.toSafeJSON ? user.toSafeJSON() : user,
    });
}

function clearTokenCookie(res) {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    });
}

module.exports = {
    signToken,
    verifyToken,
    getCookieOptions,
    sendTokenResponse,
    clearTokenCookie,
};
