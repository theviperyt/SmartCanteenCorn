const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const authUser = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        logger.warn(`No token — ${req.method} ${req.originalUrl}`);
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded?.userId || !decoded?.role) {
            logger.warn("Malformed token payload");
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token payload",
            });
        }

        req.userId = decoded.userId;
        req.role = decoded.role;
        next();

    } catch (err) {
        logger.warn(`Auth error [${err.name}]: ${err.message}`);

        const message =
            err.name === "TokenExpiredError" ? "Session expired, please log in again" :
                err.name === "JsonWebTokenError" ? "Unauthorized: Invalid token" :
                    err.name === "NotBeforeError" ? "Unauthorized: Token not yet active" :
                        "Unauthorized";

        return res.status(401).json({ success: false, message });
    }
};

module.exports = authUser;
