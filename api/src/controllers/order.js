const User = require("../models/User");
const Order = require("../models/Order");
const logger = require("../config/logger");
const Menu = require("../models/Menu");
const { validateOrder, validateStatus } = require("../utils/validate");

//placeOrder controller
const placeOrder = async (req, res) => {
    logger.info(`Place order controller hit by userId: ${req.userId}`);
    try {
        // ── 1. Validate request body 
        const { error } = validateOrder(req.body);
        if (error) {
            logger.error(`Validation error in place order by userId: ${req.userId}`, error);
            return res.status(400).json({ message: error.details[0].message });
        }

        const { items } = req.body;

        // ── 2. Extract names & fetch menu items 
        const names = items.map((item) => item.name.trim());

        const menuItems = await Menu.find({
            name: { $in: names.map((name) => new RegExp(`^${name}$`, "i")) },
            isAvailable: true,
        });

        // ── 3. Check all items exist 
        if (menuItems.length !== names.length) {
            const foundNames = new Set(menuItems.map((menu) => menu.name.toLowerCase()));
            const notFound = names.filter((name) => !foundNames.has(name.toLowerCase()));
            logger.warn(`One or more menu items not found or unavailable by userId: ${req.userId}`);
            return res.status(404).json({
                message: "One or more menu items not found or unavailable",
                notFound,
            });
        }

        // ── 4. Build lookup map 
        const menuMap = menuItems.reduce((acc, menu) => {
            acc[menu.name.toLowerCase()] = menu;
            return acc;
        }, {});

        // ── 5. Check stock === 0
        const outOfStock = menuItems.filter((menu) => menu.stock === 0);
        if (outOfStock.length > 0) {
            logger.warn(`One or more items are out of stock by userId: ${req.userId}`);
            return res.status(400).json({
                message: "One or more items are out of stock",
                outOfStock: outOfStock.map((m) => m.name),
            });
        }

        // ── 6. Check requested quantity vs available stock 
        const insufficientStock = items.filter((item) => {
            const menu = menuMap[item.name.toLowerCase()];
            return item.quantity > menu.stock;
        });
        if (insufficientStock.length > 0) {
            logger.warn(`Insufficient stock for one or more items by userId: ${req.userId}`);
            return res.status(400).json({
                message: "Insufficient stock for one or more items",
                insufficientStock: insufficientStock.map((item) => ({
                    name: item.name,
                    requested: item.quantity,
                    available: menuMap[item.name.toLowerCase()].stock,
                })),
            });
        }

        // ── 7. Calculate total price 
        const totalPrice = items.reduce((sum, item) => {
            const menu = menuMap[item.name.toLowerCase()];
            return sum + menu.price * item.quantity;
        }, 0);

        // ── 8. Build enriched items 
        const enrichedItems = items.map((item) => {
            const menu = menuMap[item.name.toLowerCase()];
            return {
                menuId: menu._id,
                menuName: menu.name, //  stored in DB
                quantity: item.quantity,
            };
        });

        // ── 9. Set expiry & save order
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const order = new Order({
            userId: req.userId,
            items: enrichedItems,
            totalPrice,
            expiresAt,
        });

        await order.save();

        // ── 10. Push order into user's orders array 
        await User.findByIdAndUpdate(
            req.userId,
            { $push: { orders: order._id } }
        );

        // ── 11. Deduct stock for each ordered item 
        await Menu.bulkWrite(
            enrichedItems.map((item) => ({
                updateOne: {
                    filter: { _id: item.menuId, stock: { $gte: item.quantity } },
                    update: { $inc: { stock: -item.quantity } },
                },
            }))
        );

        // ── 12. Auto mark isAvailable false if stock hits 0 
        await Menu.updateMany(
            { _id: { $in: enrichedItems.map((i) => i.menuId) }, stock: { $lte: 0 } },
            { $set: { isAvailable: false } }
        );

        logger.info(`Order placed successfully by userId: ${req.userId}`);
        return res.status(201).json({
            message: "Order placed successfully",
            order: {
                orderId: order._id,
                totalPrice: order.totalPrice,
                totalItemOrdered: order.totalItemOrdered,
                status: order.status,
                expiresAt: order.expiresAt,
            },
        });
    } catch (err) {
        logger.error(`Error in place order : ${err.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

//changeStatus controller
const changeStatus = async (req, res) => {
    logger.info(`Change status controller hit by userId: ${req.userId}`);
    try {
        const { status } = req.body;
        const { error } = validateStatus(req.body);
        if (error) {
            logger.warn(`Invalid status by userId: ${req.userId}`);
            return res.status(400).json({
                message: error.details[0].message,
            });
        }
        const order = await Order.findById(req.params.id);
        if (!order) {
            logger.warn(`Order not found by userId: ${req.userId}`);
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if (status === "CANCELLED" && order.status.value === "CANCELLED") {
            return res.status(400).json({
                message: "Cannot cancel an order that is already cancelled."
            });
        }

        // ── Restock if cancelled
        if (status === "CANCELLED" && order.status.value !== "CANCELLED") {
            await Menu.bulkWrite(
                order.items.map((item) => ({
                    updateOne: {
                        filter: { _id: item.menuId },
                        update: {
                            $inc: { stock: item.quantity },
                            $set: { isAvailable: true }
                        },
                    },
                }))
            );
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status: {
                        value: status,
                        changedBy: req.userId,
                        changedAt: Date.now()
                    }
                },
            },
            { returnDocument: 'after' }
        );

        logger.info(`Order status changed successfully by userId: ${req.userId}`);
        return res.status(200).json({
            message: "Order status changed successfully",
            order: updatedOrder,
        });
    } catch (err) {
        logger.error(`Error in change status : ${err.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

//getTotalOrder controller
const getTotalOrder = async (req, res) => {
    logger.info(`Get total order controller hit by userId: ${req.userId}`);
    try {
        const orders = await Order.find({ userId: req.userId })
            .select("_id items totalPrice status createdAt");

        const formattedOrders = orders.map(order => ({
            _id: order._id,
            items: order.items.map(item => ({
                menuName: item.menuName,
                quantity: item.quantity
            })),
            totalPrice: order.totalPrice,
            status: order.status,
            createdAt: order.createdAt
        }));

        logger.info(`Total orders fetched successfully by userId: ${req.userId}`);
        return res.status(200).json({
            success: true,
            totalOrders: formattedOrders.length,
            orderDetails: formattedOrders
        });
    } catch (err) {
        logger.error(`Error in getting total order: ${err.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

//getAllOrders controller (Admin only)
const getAllOrders = async (req, res) => {
    logger.info(`Get all orders controller hit by admin userId: ${req.userId}`);
    try {
        const orders = await Order.find()
            .select("_id items totalPrice status createdAt userId")
            .sort({ createdAt: -1 });

        const formattedOrders = orders.map(order => ({
            _id: order._id,
            userId: order.userId,
            items: order.items.map(item => ({
                menuName: item.menuName,
                quantity: item.quantity
            })),
            totalPrice: order.totalPrice,
            status: order.status,
            createdAt: order.createdAt
        }));

        logger.info(`All orders fetched successfully by admin userId: ${req.userId}`);
        return res.status(200).json({
            success: true,
            totalOrders: formattedOrders.length,
            orderDetails: formattedOrders
        });
    } catch (err) {
        logger.error(`Error in getting all orders: ${err.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

//getOrder controller
const getOrder = async (req, res) => {
    logger.info(`Get order controller hit by userId: ${req.userId}`);
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            logger.warn(`Order not found by userId: ${req.userId}`);
            return res.status(404).json({ message: "Order not found" });
        }

        // Only the owner or an admin can view this order
        if (order.userId.toString() !== req.userId && req.role !== "admin") {
            logger.warn(`Forbidden order access by userId: ${req.userId}`);
            return res.status(403).json({
                success: false,
                message: "Forbidden: You can only view your own orders",
            });
        }

        logger.info(`Order fetched successfully by userId: ${req.userId}`);
        return res.status(200).json(order);
    } catch (err) {
        logger.error(`Error in get order : ${err.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
module.exports = { placeOrder, changeStatus, getTotalOrder, getAllOrders, getOrder };
