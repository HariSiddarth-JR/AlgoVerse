/**
 * Resolves all permitted origins for Express CORS and CSRF protection.
 * Supports local development (localhost, 127.0.0.1), production Vercel frontend,
 * and any custom origins provided via CLIENT_URL.
 */
function getAllowedOrigins() {
    const defaultOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://algo-verse-v2.vercel.app",
    ];

    if (process.env.CLIENT_URL) {
        // Support comma-separated URLs and strip trailing slashes
        const clientOrigins = process.env.CLIENT_URL.split(",")
            .map((url) => url.trim().replace(/\/+$/, ""))
            .filter(Boolean);
        defaultOrigins.push(...clientOrigins);
    }

    return Array.from(new Set(defaultOrigins));
}

module.exports = {
    getAllowedOrigins,
};
