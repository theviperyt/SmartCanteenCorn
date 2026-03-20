const mongoose = require("mongoose");
const logger = require("./logger");
const dns = require('node:dns');

// Fix for querySrv ECONNREFUSED: Use Google DNS if system DNS fails to resolve SRV records
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    dns.setDefaultResultOrder('ipv4first');
} catch (err) {
    logger.warn(`Could not set custom DNS servers: ${err.message}`);
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Error in connecting to MongoDB: ${error.message} \n ${error.stack}`);
        process.exit(1);
    }
};

module.exports = connectDB;

