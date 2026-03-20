const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const logger = require("./config/logger");
const authRouter = require("./routers/userAuth");
const menuRouter = require("./routers/menuAuth");
const orderRouter = require("./routers/orderAuth");
const autoCancelScheduler = require("./cron/autoCancelOrders");
const { globalLimiter } = require("./middleware/rateLimiter");

// App Factory

function createApp() {
    const app = express();

    const corsOptions = {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174"
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
        optionsSuccessStatus: 200,
    };

    // Handle OPTIONS preflight FIRST before any other middleware
    app.options(/(.*)/, cors(corsOptions));

    // Core middleware
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(cookieParser());
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }));
    app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
    app.use(globalLimiter);

    // Request body logging (non-GET only)
    app.use((req, res, next) => {
        if (req.method !== "GET") {
            logger.info(`${req.method} ${req.url} from ${req.ip}`, { body: req.body });
        }
        next();
    });

    // Routes
    app.use("/api/auth", authRouter);
    app.use("/api/menu", menuRouter);
    app.use("/api/order", orderRouter);

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ message: "Route not found" });
    });

    return app;
}

// Bootstrap
async function bootstrap() {
    const app = createApp();

    await connectDB();
    autoCancelScheduler();

    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
        logger.info(`Server started in ${process.env.NODE_ENV ?? "development"} mode on port ${port}`);
    });

    return server;
}

// Process-level error guards

function registerProcessHandlers(getServer) {
    process.on("uncaughtException", (err) => {
        logger.error(`Uncaught Exception: ${err.name}: ${err.message}\n${err.stack}`);
        process.exit(1);
    });

    process.on("unhandledRejection", (err) => {
        logger.error(`Unhandled Rejection: ${err.name}: ${err.message}\n${err.stack}`);
        const server = getServer();
        server ? server.close(() => process.exit(1)) : process.exit(1);
    });
}
// Entry point

let server;
registerProcessHandlers(() => server);
bootstrap().then((s) => { server = s; });