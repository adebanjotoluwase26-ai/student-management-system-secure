const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const resultRoutes = require("./routes/resultRoutes");

dotenv.config();
const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL
].filter(Boolean);


app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without an Origin header
            // such as Thunder Client during development
            if (!origin) {
                return callback(null, true);
            }

            // Allow the configured frontend
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Allow Live Server during local development
            const isLocalDevelopment =
                /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

            if (isLocalDevelopment) {
                return callback(null, true);
            }

            return callback(
                new Error("Origin not allowed by CORS")
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/results", resultRoutes);

// ========================================
// SERVER HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "School Management API is running",
        status: "OK"
    });
});

app.get("/", (req, res) => {
    res.send("Student Management System secure backend is running!");
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log(
                `Server running on port ${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });