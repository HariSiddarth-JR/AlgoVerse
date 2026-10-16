const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { connectDB, getDBStatus, disconnectDB } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting both local development and production
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to AlgoVerse API!",
        version: "2.0.0",
    });
});

// Accurate health check endpoint
app.get("/api/health", (req, res) => {
    const db = getDBStatus();
    const isHealthy = db.connected;

    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        status: isHealthy ? "healthy" : "degraded",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: {
            connected: db.connected,
            provider: db.provider,
            host: db.host,
            name: db.name,
            error: db.error,
        },
    });
});

const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const quizRoutes = require("./routes/quizRoutes");

// Dedicated database status endpoint
app.get("/api/db-status", (req, res) => {
    const db = getDBStatus();
    res.json({
        success: true,
        database: db,
    });
});

// Learning & User routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/quizzes", quizRoutes);

// 404 handler for unmatched API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
    });
});

// Global error handler
app.use((err, req, res, _next) => {
    console.error("[SERVER ERROR]", err.message);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
});

let serverInstance = null;

async function startServer(port = PORT, options = {}) {
    try {
        await connectDB(options);

        return new Promise((resolve) => {
            serverInstance = app.listen(port, () => {
                const db = getDBStatus();
                console.log(`[SERVER] AlgoVerse API running on http://localhost:${port}`);
                console.log(`[SERVER] Database Provider: ${db.provider.toUpperCase()} (${db.connected ? "CONNECTED" : "DISCONNECTED"})`);
                resolve(serverInstance);
            });
        });
    } catch (error) {
        console.error("[SERVER FATAL] Startup failed:", error.message);
        throw error;
    }
}

async function stopServer() {
    if (serverInstance) {
        await new Promise((resolve) => serverInstance.close(resolve));
        serverInstance = null;
    }
    await disconnectDB();
}

// Graceful shutdown handling
process.on("SIGTERM", async () => {
    console.log("[SERVER] SIGTERM received. Shutting down gracefully...");
    await stopServer();
    process.exit(0);
});

process.on("SIGINT", async () => {
    console.log("[SERVER] SIGINT received. Shutting down gracefully...");
    await stopServer();
    process.exit(0);
});

// Only auto-start when executed directly, not when required by tests
if (require.main === module) {
    startServer().catch(() => {
        process.exit(1);
    });
}

module.exports = {
    app,
    startServer,
    stopServer,
};
