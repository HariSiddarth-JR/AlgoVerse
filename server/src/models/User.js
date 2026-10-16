const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [60, "Name cannot exceed 60 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                "Please provide a valid email address",
            ],
            index: true,
        },
        password: {
            type: String,
            select: false, // Do not return password by default in queries
            minlength: [8, "Password must be at least 8 characters long"],
            validate: {
                validator: function (val) {
                    // Password is required if user registered locally (no googleId)
                    if (this.authProvider === "google" && !this.password) {
                        return true;
                    }
                    return typeof val === "string" && val.length >= 8;
                },
                message: "Password is required for local accounts and must be at least 8 characters long",
            },
        },
        authProvider: {
            type: String,
            enum: ["local", "google", "both"],
            default: "local",
        },
        googleId: {
            type: String,
            sparse: true,
            index: true,
        },
        avatar: {
            type: String,
            default: "",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpires: {
            type: Date,
            select: false,
        },
        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving if modified
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON representation without sensitive fields
userSchema.methods.toSafeJSON = function () {
    const userObj = this.toObject();
    delete userObj.password;
    delete userObj.passwordResetToken;
    delete userObj.passwordResetExpires;
    delete userObj.__v;
    return userObj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
