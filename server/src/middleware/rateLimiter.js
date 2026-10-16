const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 auth attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test", // Skip rate limiting during automated tests
    message: {
        success: false,
        error: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
        code: "RATE_LIMIT_EXCEEDED",
    },
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    message: {
        success: false,
        error: "Too many requests. Please slow down.",
        code: "RATE_LIMIT_EXCEEDED",
    },
});

module.exports = {
    authLimiter,
    apiLimiter,
};
