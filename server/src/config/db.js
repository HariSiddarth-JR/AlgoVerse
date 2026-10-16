const mongoose = require("mongoose");

let dbStatus = {
    connected: false,
    provider: "disconnected", // "atlas" | "local-fallback" | "disconnected"
    host: null,
    name: null,
    error: null,
    connectedAt: null,
};

let memoryServerInstance = null;



function parseDiagnosticError(err) {
    const msg = err.message || "";
    const causeMsg = err.cause ? err.cause.message || "" : "";
    const fullText = `${msg} ${causeMsg}`;

    if (fullText.includes("SSL alert number 80") || fullText.includes("ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR")) {
        return {
            type: "ATLAS_NETWORK_ACCESS_REJECTED",
            message: "MongoDB Atlas rejected the TLS handshake (SSL Alert 80). Your current IP address is not authorized in Atlas Network Access or the cluster is paused.",
            remediation: "Log in to MongoDB Atlas -> Network Access -> Add your current public IP address to the IP Access List."
        };
    }

    if (err.code === 18 || err.code === 8000 || fullText.includes("AuthenticationFailed") || fullText.includes("auth failed")) {
        return {
            type: "ATLAS_AUTHENTICATION_FAILED",
            message: "Database authentication failed. The username or password in MONGODB_URI is invalid.",
            remediation: "Verify Database Access credentials in MongoDB Atlas and update MONGODB_URI in server/.env."
        };
    }

    if (fullText.includes("ENOTFOUND") || fullText.includes("querySrv ENOTFOUND")) {
        return {
            type: "ATLAS_DNS_SRV_FAILED",
            message: "DNS SRV resolution failed for the MongoDB host.",
            remediation: "Check your DNS settings or verify that the cluster hostname in MONGODB_URI is correct."
        };
    }

    if (fullText.includes("ETIMEDOUT") || fullText.includes("Server selection timed out")) {
        return {
            type: "ATLAS_CONNECTION_TIMEOUT",
            message: "Connection to MongoDB timed out.",
            remediation: "Check outbound network connectivity on port 27017 and ensure the Atlas cluster is active."
        };
    }

    return {
        type: "MONGODB_CONNECTION_ERROR",
        message: msg || "Unknown MongoDB connection error.",
        remediation: "Review connection URI and MongoDB server status."
    };
}

async function connectInMemory(customProvider = null) {
    try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        if (!memoryServerInstance) {
            memoryServerInstance = await MongoMemoryServer.create();
        }
        const fallbackUri = memoryServerInstance.getUri();
        await mongoose.connect(fallbackUri);

        const isTest = process.env.NODE_ENV === "test";
        const providerName = customProvider || (isTest ? "local-fallback" : "local-fallback");

        dbStatus = {
            connected: true,
            provider: providerName,
            host: "localhost (in-memory)",
            name: mongoose.connection.name || (isTest ? "algoverse_test_db" : "algoverse_local_dev"),
            error: null,
            connectedAt: new Date().toISOString(),
        };

        console.log(`[DATABASE] Connected to isolated in-memory database (${providerName}) successfully.`);
        return dbStatus;
    } catch (fallbackErr) {
        dbStatus = {
            connected: false,
            provider: "disconnected",
            host: null,
            name: null,
            error: fallbackErr.message,
            connectedAt: null,
        };
        throw fallbackErr;
    }
}

async function connectDB(options = {}) {
    const { 
        allowFallback = process.env.ALLOW_LOCAL_FALLBACK === "true", 
        timeoutMs = 7000,
        forceMemory = false
    } = options;

    if (forceMemory) {
        return await connectInMemory("local-fallback");
    }

    // =========================================================================
    // PRODUCTION SAFETY GUARD: Automated tests must NEVER touch production/Atlas
    // =========================================================================
    if (process.env.NODE_ENV === "test") {
        const testUri = process.env.MONGODB_TEST_URI;
        const prodUri = process.env.MONGODB_URI;
        if (testUri) {
            if (prodUri && testUri === prodUri) {
                const guardError = new Error(
                    "PRODUCTION_SAFETY_GUARD: MONGODB_TEST_URI cannot be identical to production MONGODB_URI. Aborting test execution to protect user data."
                );
                console.error(`[DATABASE CRITICAL] ${guardError.message}`);
                throw guardError;
            }
            console.log("[DATABASE] Connecting to isolated test MongoDB cluster via MONGODB_TEST_URI...");
            await mongoose.connect(testUri, { serverSelectionTimeoutMS: timeoutMs });
            dbStatus = {
                connected: true,
                provider: "local-fallback",
                host: mongoose.connection.host,
                name: mongoose.connection.name,
                error: null,
                connectedAt: new Date().toISOString(),
            };
            return dbStatus;
        }

        // Default: strictly enforce isolated in-memory MongoMemoryServer for all automated tests
        console.log("[DATABASE] Automated test environment detected (NODE_ENV=test). Enforcing isolated in-memory MongoMemoryServer.");
        return await connectInMemory("local-fallback");
    }

    const uri = process.env.MONGODB_URI;

    if (!uri && !allowFallback) {
        const errorMsg = "MONGODB_URI is missing from server/.env";
        dbStatus = {
            connected: false,
            provider: "disconnected",
            host: null,
            name: null,
            error: errorMsg,
            connectedAt: null,
        };
        throw new Error(errorMsg);
    }

    // Attempt Atlas / primary connection if URI exists
    if (uri) {
        try {
            console.log("Connecting to primary MongoDB (Atlas)...");
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: timeoutMs,
            });

            const host = mongoose.connection.host;
            const name = mongoose.connection.name;

            dbStatus = {
                connected: true,
                provider: "atlas",
                host,
                name,
                error: null,
                connectedAt: new Date().toISOString(),
            };

            console.log(`[DATABASE] MongoDB Atlas connected successfully to host: ${host}, database: ${name}`);
            return dbStatus;
        } catch (error) {
            const diagnostic = parseDiagnosticError(error);
            console.error(`[DATABASE ERROR] ${diagnostic.type}: ${diagnostic.message}`);
            console.error(`[DATABASE REMEDIATION] ${diagnostic.remediation}`);

            dbStatus = {
                connected: false,
                provider: "disconnected",
                host: null,
                name: null,
                error: diagnostic.message,
                diagnostic,
                connectedAt: null,
            };

            if (!allowFallback) {
                const enrichedErr = new Error(`${diagnostic.type}: ${diagnostic.message}\nAction needed: ${diagnostic.remediation}`);
                enrichedErr.diagnostic = diagnostic;
                throw enrichedErr;
            }
        }
    }

    // Fallback to in-memory MongoDB for local development if enabled and Atlas is unreachable
    if (allowFallback) {
        console.warn("\n====================================================================");
        console.warn("[DATABASE FALLBACK ACTIVE] Using in-memory MongoMemoryServer!");
        console.warn("NOTICE: Data is stored in local memory and will NOT persist to Atlas.");
        console.warn("To use Atlas, resolve the Network Access / credential issue and restart.");
        console.warn("====================================================================\n");

        return await connectInMemory("local-fallback");
    }

    return dbStatus;
}

function getDBStatus() {
    return {
        ...dbStatus,
        mongooseState: mongoose.connection.readyState,
        mongooseStateText: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
    };
}

async function disconnectDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (memoryServerInstance) {
        await memoryServerInstance.stop();
        memoryServerInstance = null;
    }
    dbStatus = {
        connected: false,
        provider: "disconnected",
        host: null,
        name: null,
        error: null,
        connectedAt: null,
    };
}

module.exports = {
    connectDB,
    getDBStatus,
    disconnectDB,
    parseDiagnosticError,
};
