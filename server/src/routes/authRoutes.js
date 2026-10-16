const express = require("express");
const router = express.Router();

const {
    register,
    login,
    googleAuth,
    linkGoogle,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
} = require("../controllers/authController");

const { protect, csrfProtection } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

// Apply CSRF protection to mutating auth endpoints
router.use(csrfProtection);

// Public authentication routes (with rate limiting)
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleAuth);
router.post("/logout", logout);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Protected authentication routes
router.get("/me", protect, getMe);
router.post("/link-google", protect, linkGoogle);

module.exports = router;
