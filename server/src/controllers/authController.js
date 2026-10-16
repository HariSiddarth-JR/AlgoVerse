const crypto = require("crypto");
const User = require("../models/User");
const { sendTokenResponse, clearTokenCookie } = require("../utils/token");
const googleAuthService = require("../services/googleAuth");

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
// Minimum 8 characters, at least one letter and one number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// @desc    Register a new user with email and password
// @route   POST /api/auth/register
// @access  Public
async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Please provide a valid name.",
            });
        }

        if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({
                success: false,
                error: "Please provide a valid email address.",
            });
        }

        if (!password || typeof password !== "string" || !PASSWORD_REGEX.test(password)) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 8 characters long and contain both letters and numbers.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "An account with this email address already exists.",
            });
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            authProvider: "local",
            isEmailVerified: false,
            lastLogin: new Date(),
        });

        sendTokenResponse(user, 201, res, "Account registered successfully.");
    } catch (error) {
        console.error("[AUTH REGISTER ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to register account. Please try again.",
        });
    }
}

// @desc    Login with email and password
// @route   POST /api/auth/login
// @access  Public
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                error: "Please provide both email and password.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Select password explicitly since it is excluded by default
        const user = await User.findOne({ email: normalizedEmail }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password.",
            });
        }

        // Account registered via Google without a password
        if (!user.password) {
            return res.status(401).json({
                success: false,
                error: "This account was registered using Google Sign-In. Please sign in with Google or reset your password.",
                code: "GOOGLE_ACCOUNT_NO_PASSWORD",
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password.",
            });
        }

        user.lastLogin = new Date();
        await user.save();

        sendTokenResponse(user, 200, res, "Logged in successfully.");
    } catch (error) {
        console.error("[AUTH LOGIN ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Login failed. Please try again.",
        });
    }
}

// @desc    Google OAuth Sign-In / Registration
// @route   POST /api/auth/google
// @access  Public
async function googleAuth(req, res) {
    try {
        const { credential, linkPassword } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                error: "Google credential token is required.",
            });
        }

        const googlePayload = await googleAuthService.verifyGoogleIdToken(credential);

        if (!googlePayload.isEmailVerified) {
            return res.status(400).json({
                success: false,
                error: "Your Google email address is not verified. Please verify your Google email first.",
            });
        }

        // 1. Search by existing googleId
        let user = await User.findOne({ googleId: googlePayload.googleId });
        if (user) {
            user.lastLogin = new Date();
            if (googlePayload.avatar && !user.avatar) {
                user.avatar = googlePayload.avatar;
            }
            await user.save();
            return sendTokenResponse(user, 200, res, "Signed in with Google successfully.");
        }

        // 2. Search by email to prevent account conflicts / hijacking
        user = await User.findOne({ email: googlePayload.email }).select("+password");

        if (user) {
            // Existing user has local password, but no googleId linked yet
            // Safeguard: Never automatically merge without verification of existing password
            if (user.password && !user.googleId) {
                if (!linkPassword) {
                    return res.status(409).json({
                        success: false,
                        error: "An account with this email already exists. To link your Google account, please enter your existing password.",
                        code: "ACCOUNT_EXISTS_WITH_PASSWORD",
                        email: user.email,
                    });
                }

                const isPasswordValid = await user.comparePassword(linkPassword);
                if (!isPasswordValid) {
                    return res.status(401).json({
                        success: false,
                        error: "Incorrect existing password. Google account was not linked.",
                    });
                }

                // Password verified: safely link Google identity
                user.googleId = googlePayload.googleId;
                user.authProvider = "both";
                user.isEmailVerified = true;
                if (!user.avatar && googlePayload.avatar) user.avatar = googlePayload.avatar;
                user.lastLogin = new Date();
                await user.save();

                return sendTokenResponse(user, 200, res, "Google account linked and signed in successfully.");
            }
        }

        // 3. Create a brand-new Google-authenticated user
        const newUser = await User.create({
            name: googlePayload.name,
            email: googlePayload.email,
            googleId: googlePayload.googleId,
            avatar: googlePayload.avatar,
            authProvider: "google",
            isEmailVerified: true,
            lastLogin: new Date(),
        });

        sendTokenResponse(newUser, 201, res, "Registered and signed in with Google successfully.");
    } catch (error) {
        console.error("[AUTH GOOGLE ERROR]", error.message);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || "Google authentication failed.",
            code: error.code || "GOOGLE_AUTH_ERROR",
        });
    }
}

// @desc    Link Google account to authenticated user session
// @route   POST /api/auth/link-google
// @access  Protected
async function linkGoogle(req, res) {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({
                success: false,
                error: "Google credential token is required.",
            });
        }

        const googlePayload = await googleAuthService.verifyGoogleIdToken(credential);

        // Check if googleId is already taken by another user
        const existingGoogleUser = await User.findOne({ googleId: googlePayload.googleId });
        if (existingGoogleUser && existingGoogleUser._id.toString() !== req.user._id.toString()) {
            return res.status(409).json({
                success: false,
                error: "This Google account is already linked to another user.",
            });
        }

        const user = await User.findById(req.user._id);
        user.googleId = googlePayload.googleId;
        user.authProvider = user.password ? "both" : "google";
        user.isEmailVerified = true;
        if (!user.avatar && googlePayload.avatar) user.avatar = googlePayload.avatar;
        await user.save();

        res.json({
            success: true,
            message: "Google account successfully linked.",
            user: user.toSafeJSON(),
        });
    } catch (error) {
        console.error("[AUTH LINK GOOGLE ERROR]", error.message);
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || "Failed to link Google account.",
        });
    }
}

// @desc    Logout user and clear session cookie
// @route   POST /api/auth/logout
// @access  Public
async function logout(req, res) {
    clearTokenCookie(res);
    res.json({
        success: true,
        message: "Logged out successfully.",
    });
}

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Protected
async function getMe(req, res) {
    res.json({
        success: true,
        user: req.user.toSafeJSON(),
    });
}

// @desc    Forgot password - request reset token
// @route   POST /api/auth/forgot-password
// @access  Public
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({
                success: false,
                error: "Please provide a valid email address.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        let devToken = null;

        if (user) {
            // Generate 32-byte cryptographically secure random token
            const resetToken = crypto.randomBytes(32).toString("hex");
            // Store hashed version in DB
            user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
            // Expire in 1 hour
            user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
            await user.save();

            // In development or test environments without an active SMTP provider,
            // expose the devToken so the feature can be tested and verified locally.
            if (process.env.NODE_ENV !== "production") {
                devToken = resetToken;
                console.log(`[DEV PASSWORD RESET] Token for ${user.email}: ${resetToken}`);
            }
        }

        // Prevent email enumeration: Always return uniform success message
        res.json({
            success: true,
            message: "If an account with that email exists, password reset instructions have been generated.",
            ...(devToken && { devResetToken: devToken }),
        });
    } catch (error) {
        console.error("[AUTH FORGOT PASSWORD ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Unable to process password reset request. Please try again.",
        });
    }
}

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;

        if (!token || typeof token !== "string") {
            return res.status(400).json({
                success: false,
                error: "Reset token is required.",
            });
        }

        if (!newPassword || typeof newPassword !== "string" || !PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({
                success: false,
                error: "New password must be at least 8 characters long and contain both letters and numbers.",
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: "Invalid or expired password reset token.",
            });
        }

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.authProvider = user.authProvider === "google" ? "both" : user.authProvider;
        user.lastLogin = new Date();
        await user.save();

        sendTokenResponse(user, 200, res, "Password has been reset successfully. You are now logged in.");
    } catch (error) {
        console.error("[AUTH RESET PASSWORD ERROR]", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to reset password. Please try again.",
        });
    }
}

module.exports = {
    register,
    login,
    googleAuth,
    linkGoogle,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
};
