const express = require("express");
const User = require("../models/User");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET LOGGED-IN STUDENT'S PROFILE
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User account not found"
            });
        }

        if (user.role !== "student") {
            return res.status(403).json({
                message: "This route is for students only"
            });
        }

        if (!user.studentId) {
            return res.status(400).json({
                message: "This account is not linked to a student record yet"
            });
        }

        const student = await Student.findOne({
            studentId: user.studentId
        });

        if (!student) {
            return res.status(404).json({
                message: "Student record not found"
            });
        }

        res.json({
            student
        });

    } catch (error) {
        console.error("Student profile error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;