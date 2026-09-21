const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: true,
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        ca: {
            type: Number,
            required: true,
            min: 0,
            max: 40
        },

        exam: {
            type: Number,
            required: true,
            min: 0,
            max: 60
        },

        total: {
            type: Number,
            required: true
        },

        grade: {
            type: String,
            required: true
        },

        term: {
            type: String,
            required: true
        },

        session: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Result", resultSchema);