const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true],
            trim: true,
            unique: true,
            minlength: [2],
            maxlength: [100],
        },
        price: {
            type: Number,
            required: [true],
            min: [0],
        },
        stock: {
            type: Number,
            required: [true],
            min: [0],
            default: 0,
        },
        isAvailable: {
            type: Boolean,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true],
        },
    },
    { timestamps: true }
);

const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;