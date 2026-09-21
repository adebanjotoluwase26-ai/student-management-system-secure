const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        firstName: {
            type: String,
            required: true,
            trim: true
        },

        surname: {
            type: String,
            required: true,
            trim: true
        },

        studentClass: {
            type: String,
            required: true,
            trim: true
        },

        homeAddress: {
            type: String,
            default: ""
        },

        email: {
            type: String,
            default: "",
            lowercase: true,
            trim: true
        },

        dob: {
            type: String,
            default: ""
        },

        gender: {
            type: String,
            default: ""
        },

        phoneNo: {
            type: String,
            default: ""
        },

        subjects: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);