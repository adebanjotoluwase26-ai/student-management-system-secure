const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const Student = require("../models/Student");
const crypto = require("crypto");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email and password"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Registration successful",
            userId: user._id
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Server error during registration"
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (
            user.role === "student" &&
            user.accountStatus !== "active"
        ) {
            return res.status(403).json({
                message:
                    "Your account has not been activated yet"
            });
        }

        if (
            user.role === "student" &&
            user.accountStatus === "deactivated"
        ) {
            return res.status(403).json({
                message:
                    "Your account has been deactivated. Please contact the school administrator."
            });
        }
        
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Server error during login"
        });
    }
});

// PROTECTED USER PROFILE
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            user
        });

    } catch (error) {
        console.error("Profile error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// ========================================
// ACTIVATE STUDENT ACCOUNT
// ========================================

router.post("/activate", async (req, res) => {
    try {
        const {
            studentId,
            activationCode,
            dob,
            email,
            password
        } = req.body || {};


        // Check required fields
        if (
            !studentId ||
            !activationCode ||
            !dob ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Student ID, activation code, date of birth, email and password are required"
            });
        }


        // Find pending student account
        const user = await User.findOne({
            studentId,
            role: "student"
        });


        if (!user) {
            return res.status(404).json({
                message:
                    "Student account not found"
            });
        }


        // Already active
        if (user.accountStatus === "active") {
            return res.status(400).json({
                message:
                    "This account has already been activated"
            });
        }


        // Check activation expiry
        if (
            !user.activationExpiresAt ||
            user.activationExpiresAt < new Date()
        ) {
            return res.status(400).json({
                message:
                    "Activation code has expired"
            });
        }


        // Find student record
        const student = await Student.findOne({
            studentId
        });


        if (!student) {
            return res.status(404).json({
                message:
                    "Student record not found"
            });
        }


        // Verify date of birth
        if (student.dob !== dob) {
            return res.status(401).json({
                message:
                    "Student information could not be verified"
            });
        }


        // Verify activation code
        const codeMatches =
            await bcrypt.compare(
                activationCode.toUpperCase(),
                user.activationCodeHash
            );


        if (!codeMatches) {
            return res.status(401).json({
                message:
                    "Invalid activation code"
            });
        }


        // Check email is not already in use
        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (
            existingUser &&
            existingUser._id.toString() !==
                user._id.toString()
        ) {
            return res.status(400).json({
                message:
                    "Email is already registered"
            });
        }


        // Hash new password
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // Activate account
        user.email =
            email.toLowerCase();

        user.password =
            hashedPassword;

        user.accountStatus =
            "active";

        user.activationCodeHash =
            null;

        user.activationExpiresAt =
            null;

        user.activatedAt =
            new Date();


        await user.save();


        // Keep student record email in sync
        student.email =
            email.toLowerCase();

        await student.save();


        res.json({
            message:
                "Account activated successfully"
        });


    } catch (error) {

        console.error(
            "Account activation error:",
            error.message
        );

        res.status(500).json({
            message:
                "Server error during account activation"
        });
    }
});

// ========================================
// REQUEST PASSWORD RESET
// ========================================

router.post("/forgot-password", async (req, res) => {
    try {
        const { email, studentId } = req.body || {};

        if (!email && !studentId) {
            return res.status(400).json({
                message:
                    "Enter your email address or student ID"
            });
        }

        const query = email
            ? { email: email.toLowerCase() }
            : { studentId };

        const user = await User.findOne(query);

        // Do not reveal whether an account exists
        if (!user || user.role !== "student") {
            return res.json({
                message:
                    "If the account exists, password reset instructions will be provided."
            });
        }

        if (user.accountStatus !== "active") {
            return res.json({
                message:
                    "If the account exists, password reset instructions will be provided."
            });
        }

        const resetToken =
            crypto.randomBytes(32).toString("hex");

        user.resetTokenHash =
            await bcrypt.hash(resetToken, 10);

        user.resetTokenExpiresAt =
            new Date(
                Date.now() + 15 * 60 * 1000
            );

        user.resetRequestedAt =
            new Date();

        await user.save();

        res.json({
            message:
                "Password reset request created successfully"
        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error.message
        );

        res.status(500).json({
            message:
                "Server error while requesting password reset"
        });
    }
});

// ========================================
// RESET PASSWORD
// ========================================

router.post("/reset-password", async (req, res) => {
    try {
        const {
            studentId,
            resetToken,
            newPassword
        } = req.body || {};

        if (
            !studentId ||
            !resetToken ||
            !newPassword
        ) {
            return res.status(400).json({
                message:
                    "Student ID, reset token and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters"
            });
        }

        const user = await User.findOne({
            studentId,
            role: "student",
            accountStatus: "active"
        });

        if (!user) {
            return res.status(400).json({
                message:
                    "Invalid password reset request"
            });
        }

        if (
            !user.resetTokenHash ||
            !user.resetTokenExpiresAt ||
            user.resetTokenExpiresAt < new Date()
        ) {
            return res.status(400).json({
                message:
                    "Reset token is invalid or expired"
            });
        }

        const tokenMatches =
            await bcrypt.compare(
                resetToken,
                user.resetTokenHash
            );

        if (!tokenMatches) {
            return res.status(400).json({
                message:
                    "Reset token is invalid or expired"
            });
        }

        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );

        user.resetTokenHash = null;
        user.resetTokenExpiresAt = null;
        user.resetRequestedAt = null;

        await user.save();

        res.json({
            message:
                "Password reset successfully"
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error.message
        );

        res.status(500).json({
            message:
                "Server error while resetting password"
        });
    }
});

module.exports = router;