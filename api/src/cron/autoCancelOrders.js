const cron = require('node-cron');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const logger = require('../config/logger');

const autoCancelScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            // Find orders where status is PENDING and expiresAt is in the past
            const staleOrders = await Order.find({
                'status.value': 'PENDING',
                expiresAt: { $lt: new Date() }
            });

            if (staleOrders.length === 0) {
                return;
            }

            logger.info(`Found ${staleOrders.length} stale order(s). Auto-cancelling...`);

            const orderIds = staleOrders.map(o => o._id);

            // Accumulate items to restock
            const restockMap = new Map();
            for (const order of staleOrders) {
                for (const item of order.items) {
                    const idStr = item.menuId.toString();
                    restockMap.set(idStr, (restockMap.get(idStr) || 0) + item.quantity);
                }
            }

            // Restore menu stock
            const bulkMenuOps = [];
            for (const [menuId, quantity] of restockMap.entries()) {
                bulkMenuOps.push({
                    updateOne: {
                        filter: { _id: menuId },
                        update: {
                            $inc: { stock: quantity },
                            $set: { isAvailable: true }
                        }
                    }
                });
            }

            if (bulkMenuOps.length > 0) {
                await Menu.bulkWrite(bulkMenuOps);
            }

            // Mark orders as CANCELLED
            await Order.updateMany(
                { _id: { $in: orderIds } },
                {
                    $set: {
                        status: {
                            value: 'CANCELLED',
                            changedBy: 'ACO',
                            changedAt: new Date()
                        }
                    }
                }
            );

            logger.info(`Successfully auto-cancelled ${staleOrders.length} stale order(s). Order IDs: ${orderIds}`);
        } catch (error) {
            logger.error(`Error in autoCancelScheduler: ${error.message}`);
        }
    });
    logger.info("Auto-cancel cron scheduler initialized...");
};

module.exports = autoCancelScheduler;
