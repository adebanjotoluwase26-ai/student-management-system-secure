const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String
        },

        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        },

        studentId: {
            type: String,
            default: null
        },

        accountStatus: {
            type: String,
            enum: ["pending", "active", "deactivated"],
            default: "active"
        },

        activationCodeHash: {
            type: String,
            default: null
        },

        activationExpiresAt: {
            type: Date,
            default: null
        },

        activatedAt: {
            type: Date,
            default: null
        },

        resetTokenHash: {
            type: String,
            default: null
        },

        resetTokenExpiresAt: {
            type: Date,
            default: null
        },

        resetRequestedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);