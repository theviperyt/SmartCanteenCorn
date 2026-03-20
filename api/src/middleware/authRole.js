const logger = require("../config/logger");

const validateRole = (allowedRole) => {
    return (req, res, next) => {
        try {
            if (req.role !== allowedRole) {
                logger.warn(
                    `Forbidden access by userId: ${req.userId}, role: ${req.role}`
                );

                return res.status(403).json({
                    success: false,
                    message: `Forbidden: Only ${allowedRole} can access this`,
                });
            }
            next();
        } catch (err) {
            logger.error(`Role validation error: ${err.message}`);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    };
};

module.exports = validateRole;