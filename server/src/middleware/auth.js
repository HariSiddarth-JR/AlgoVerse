const { verifyToken } = require("../utils/token");
const User = require("../models/User");

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL,
].filter(Boolean);

// Authentication middleware to protect routes
async function protect(req, res, next) {
    let token = null;

    // 1. Check HTTP-only cookie first (preferred)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // 2. Fall back to Authorization: Bearer <token> header
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Authentication required. Please log in.",
            code: "NO_TOKEN",
        });
    }

    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "The user belonging to this session no longer exists.",
                code: "USER_NOT_FOUND",
            });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                error: "Session has expired. Please log in again.",
                code: "TOKEN_EXPIRED",
            });
        }

        return res.status(401).json({
            success: false,
            error: "Invalid session token. Please log in again.",
            code: "INVALID_TOKEN",
        });
    }
}

// CSRF validation for mutating requests (POST, PUT, PATCH, DELETE)
function csrfProtection(req, res, next) {
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    // In test environment, skip Origin checking if not provided by supertest
    if (process.env.NODE_ENV === "test" && !req.headers.origin && !req.headers.referer) {
        return next();
    }

    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);

    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({
            success: false,
            error: "Cross-site request blocked (CSRF validation failed).",
            code: "CSRF_ERROR",
        });
    }

    next();
}

// Role-based authorization
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: "You do not have permission to perform this action.",
                code: "FORBIDDEN",
            });
        }
        next();
    };
}

module.exports = {
    protect,
    csrfProtection,
    authorize,
};
