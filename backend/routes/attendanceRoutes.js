const express = require("express");

const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// ========================================
// ADMIN: RECORD ATTENDANCE
// ========================================

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { studentId, date, status } = req.body || {};

            if (!studentId || !date || !status) {
                return res.status(400).json({
                    message: "Student ID, date and status are required"
                });
            }

            if (!["Present", "Absent"].includes(status)) {
                return res.status(400).json({
                    message: "Status must be Present or Absent"
                });
            }

            const student = await Student.findOne({
                studentId
            });

            if (!student) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }

            const existingRecord = await Attendance.findOne({
                studentId,
                date
            });

            if (existingRecord) {
                return res.status(400).json({
                    message: "Attendance has already been recorded for this date"
                });
            }

            const attendance = await Attendance.create({
                studentId,
                date,
                status
            });

            res.status(201).json({
                message: "Attendance recorded successfully",
                attendance
            });

        } catch (error) {
            console.error(
                "Record attendance error:",
                error.message
            );

            res.status(500).json({
                message: "Server error while recording attendance"
            });
        }
    }
);

// ========================================
// ADMIN: VIEW ALL ATTENDANCE
// ========================================

router.get(
    "/history",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const records = await Attendance.find().sort({
                date: -1,
                createdAt: -1
            });

            const students = await Student.find();

            const studentMap = new Map(
                students.map(student => [
                    student.studentId,
                    student
                ])
            );

            const attendanceHistory = records.map(record => {
                const student = studentMap.get(
                    record.studentId
                );

                return {
                    _id: record._id,
                    studentId: record.studentId,
                    studentName: student
                        ? `${student.firstName} ${student.surname}`
                        : "Unknown Student",
                    studentClass: student
                        ? student.studentClass
                        : "-",
                    date: record.date,
                    status: record.status
                };
            });

            res.json({
                records: attendanceHistory
            });

        } catch (error) {
            console.error(
                "Get attendance history error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while retrieving attendance history"
            });
        }
    }
);

// ========================================
// STUDENT: VIEW OWN ATTENDANCE
// ========================================

router.get(
    "/me",
    authMiddleware,
    async (req, res) => {
        try {
            if (req.user.role !== "student") {
                return res.status(403).json({
                    message: "This route is for students only"
                });
            }

            const user = await require("../models/User").findById(
                req.user.userId
            );

            if (!user) {
                return res.status(404).json({
                    message: "User account not found"
                });
            }

            if (!user.studentId) {
                return res.status(400).json({
                    message: "This account is not linked to a student record"
                });
            }

            const records = await Attendance.find({
                studentId: user.studentId
            }).sort({
                date: -1
            });

            res.json({
                studentId: user.studentId,
                records
            });

        } catch (error) {
            console.error(
                "Get attendance error:",
                error.message
            );

            res.status(500).json({
                message: "Server error while retrieving attendance"
            });
        }
    }
);

module.exports = router;