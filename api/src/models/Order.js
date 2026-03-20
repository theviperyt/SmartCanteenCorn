const { required } = require("joi");
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                menuId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Menu",
                    required: true,
                },
                menuName: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        totalItemOrdered: {
            type: Number,
            default: 0,
        },
        status: {
            value: {
                type: String,
                enum: ["PENDING", "CONFIRMED", "CANCELLED"],
                default: "PENDING"
            },
            changedBy: {
                type: mongoose.Schema.Types.Mixed,
                ref: "User"
            },
            changedAt: {
                type: Date
            }
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

orderSchema.pre("save", async function () {
    this.totalItemOrdered = this.items.reduce((sum, item) => sum + item.quantity, 0);
});

orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ expiresAt: 1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;