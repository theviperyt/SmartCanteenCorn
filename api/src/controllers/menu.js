const Menu = require("../models/Menu");
const logger = require("../config/logger");
const { validateMenu, validateUpdateMenu } = require("../utils/validate");

//addMenu controller
const addMenu = async (req, res) => {
    logger.info(`Add menu controller hit by userId: ${req.userId}`);
    try {
        const { name, price, stock } = req.body;

        // -- Validation --
        const { error } = validateMenu(req.body);
        if (error) {
            logger.warn(`Validation error adding menu item: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const existingMenu = await Menu.findOne({ name: name.trim() });
        if (existingMenu) {
            logger.warn(`Menu item already exists: ${name.trim()}`);
            return res.status(400).json({
                success: false,
                message: "Menu item with this name already exists",
            });
        }

        const finalStock = stock ?? 0;
        const newMenu = await Menu.create({
            name: name.trim(),
            price,
            stock: finalStock,
            isAvailable: finalStock > 0,
            adminId: req.userId,
        });

        logger.info(`Menu item "${newMenu.name}" added by admin userId: ${req.userId}`);

        return res.status(201).json({
            success: true,
            message: "Menu item added successfully",
            data: newMenu,
        });

    } catch (err) {
        logger.error(`Error adding menu item: ${err.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

//updateMenu controller
const updateMenu = async (req, res) => {
    logger.info(`Update menu controller hit by userId: ${req.userId}`);

    try {
        const existingMenu = await Menu.findById(req.params.id);
        if (!existingMenu) {
            logger.warn(`Menu item not found for update: ${req.params.id}`);
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        let oldMenuName = existingMenu.name;

        const { name, price, stock } = req.body;

        const { error } = validateUpdateMenu(req.body);
        if (error) {
            logger.warn(`Validation error updating menu item: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const updatedStock = stock ?? existingMenu.stock;

        const updatedMenu = await Menu.findByIdAndUpdate(
            req.params.id,
            {
                name: name ?? existingMenu.name,
                price: price ?? existingMenu.price,
                stock: updatedStock,
                isAvailable: updatedStock > 0,
                adminId: req.userId,
            },
            { returnDocument: 'after' }
        );

        logger.info(`Menu item ${oldMenuName} to ${updatedMenu.name} updated by admin userId: ${req.userId}`);

        return res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            data: updatedMenu,
        });

    } catch (err) {
        logger.error(`Error updating menu item: ${err.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

//deleteMenu controller
const deleteMenu = async (req, res) => {
    logger.info(`Delete menu controller hit by userId: ${req.userId}`);
    try {
        const existingMenu = await Menu.findById(req.params.id);
        if (!existingMenu) {
            logger.warn(`Menu item not found for delete: ${req.params.id}`);
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }

        const { confirm } = req.query;

        if (!confirm) {
            return res.status(200).json({
                success: false,
                message: `Are you sure you want to delete "${existingMenu.name}"?`,
                hint: "Resend the request with ?confirm=yes to proceed or ?confirm=no to cancel.",
            });
        }

        if (confirm === "no") {
            return res.status(200).json({
                success: false,
                message: "Delete action cancelled.",
            });
        }

        if (confirm !== "yes") {
            return res.status(400).json({
                success: false,
                message: `Invalid confirmation value. Use ?confirm=yes or ?confirm=no`,
            });
        }

        await Menu.findByIdAndDelete(req.params.id);
        logger.info(`Menu item deleted: ${req.params.id} name: ${existingMenu.name}, deleted by userId: ${req.userId}`);
        return res.status(200).json({
            success: true,
            message: "Menu item deleted successfully",
            deletedItem: existingMenu,
        });

    } catch (err) {
        logger.error(`Error in deleting menu item: ${err.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

//getMenu controller
const getMenu = async (req, res) => {
    logger.info(`Get menu controller hit by userId: ${req.userId}`);
    try {
        const menu = await Menu.find({}, "name price stock");

        logger.info(`Menu items fetched successfully by userId: ${req.userId}`);
        return res.status(200).json({
            success: true,
            message: "Menu items fetched successfully",
            data: menu,
        });
    } catch (err) {
        logger.error(`Error in getting menu item: ${err.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

//currentAvailbleItems controller
const currentAvailbleItems = async (req, res) => {
    logger.info(`Current availble items controller hit by userId: ${req.userId}`);
    try {
        const items = await Menu.find(
            { isAvailable: true },
            "name price stock"
        );

        if (items.length === 0) {
            logger.warn(`No available items found by userId: ${req.userId}`);
            return res.status(404).json({
                success: false,
                message: "No available items found",
            });
        }
        logger.info(`Current availble items fetched successfully by userId: ${req.userId}`);
        return res.status(200).json({
            success: true,
            message: "Current available items fetched successfully",
            data: items,
        });
    } catch (err) {
        logger.error(`Error in current availble items : ${err.message}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
module.exports = { addMenu, updateMenu, deleteMenu, getMenu, currentAvailbleItems };