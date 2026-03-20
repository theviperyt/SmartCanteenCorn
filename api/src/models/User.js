const mongoose = require("mongoose");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        }
    ]
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        try {
            this.password = await argon2.hash(this.password);
        } catch (err) {
            return next(err);
        }
    }
});

userSchema.methods.comparePassword = async function (userPassword) {
    try {
        return await argon2.verify(this.password, userPassword);
    } catch (err) {
        throw err;
    }
}

userSchema.index({ name: "text" });

const User = mongoose.model("User", userSchema);

module.exports = User;

