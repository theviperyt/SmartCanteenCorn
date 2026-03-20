const crypto = require("crypto");
const logger = require("../config/logger");
const User = require("../models/User");
const { validateRegister, validateLogin } = require("../utils/validate");
const genToken = require("../utils/genToken");
const Menu = require("../models/Menu");
const Order = require("../models/Order");

const sendTokenResponse = (user, token, statusCode, res, additionalData = {}) => {
    const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            ...additionalData,
            data: {
                id: user._id,
                username: user.name,
                role: user.role
            }
        });
};

// Register
const register = async (req, res) => {
    logger.info("Registeration endpoint hit...");
    try {
        const { error: err } = validateRegister(req.body);
        if (err) {
            logger.error('validation error', err.details[0].message);
            return res.status(400).json({
                success: false,
                message: err.details[0].message
            });
        }
        const { name, phone, password, role, adminKey } = req.body;

        const exsistingUser = await User.findOne({ phone });
        if (exsistingUser) {
            logger.warn('User already exists');
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        if (role === "admin") {
            const expectedKey = process.env.ADMIN_KEY || "";
            const providedKey = adminKey || "";
            
            // Use crypto.timingSafeEqual to prevent timing attacks
            const isMatch = providedKey.length === expectedKey.length && 
                            providedKey.length > 0 && 
                            crypto.timingSafeEqual(Buffer.from(providedKey), Buffer.from(expectedKey));

            if (!isMatch) {
                logger.warn(`Invalid admin key attempt by ${name}`);
                return res.status(400).json({
                    success: false,
                    message: "Admin key is incorrect"
                });
            }
        }

        const user = await User.create({ name, phone, password, role });
        const token = await genToken(user);

        logger.info(`User registered successfully :- ${user._id}`);

        return sendTokenResponse(user, token, 201, res, {
            message: `User registered successfully :- ${user._id}`
        });

    } catch (err) {
        logger.error(`Error in registerUser controller: ${err.message}`, {
            stack: err.stack
        });
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Login 
const login = async (req, res) => {
    logger.info("Login endpoint hit...");
    try {
        const { error: err } = validateLogin(req.body);
        if (err) {
            logger.error('validation error', err.details[0].message);
            return res.status(400).json({
                success: false,
                message: err.details[0].message
            });
        }
        const { phone, password } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            logger.warn('User not found');
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // user valid password or not
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            logger.warn("Invalid password");
            return res.status(400).json({
                success: false,
                message: "Invalid password",
            });
        }

        const token = await genToken(user);

        logger.info(`User logged in successfully :- ${user._id}`);

        return sendTokenResponse(user, token, 200, res, {
            message: `User logged in successfully :- ${user._id}`
        });

    } catch (err) {
        logger.error(`Error in loginUser controller: ${err.message}`, {
            stack: err.stack
        });
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// logout

const logout = async (req, res) => {
    logger.info("Logout endpoint hit...");
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ?
                'none' : 'strict',
        });
        logger.info(`User logged out successfully :- ${req.userId || "Unknown"}`);
        res.status(200).json({ success: true, message: 'User logged out successfully' });
    } catch (err) {
        logger.error(`Error in logoutUser controller: ${err.message}`);
        res.status(500).json({ success: false, message: err.message });
    }
}


module.exports = { register, login, logout };