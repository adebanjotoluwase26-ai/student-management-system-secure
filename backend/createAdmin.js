const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const adminEmail = "admin@school.com";
        const adminPassword = "Admin1234";

        const existingAdmin = await User.findOne({
            email: adminEmail
        });

        if (existingAdmin) {
            console.log("Admin account already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            adminPassword,
            10
        );

        const admin = await User.create({
            name: "School Administrator",
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin account created successfully!");
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);

        process.exit(0);

    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
}

createAdmin();