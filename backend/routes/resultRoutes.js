const express = require("express");

const Result = require("../models/Result");
const Student = require("../models/Student");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// ========================================
// ADMIN: RECORD RESULT
// ========================================

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const {
                studentId,
                subject,
                ca,
                exam,
                total,
                grade,
                term,
                session
            } = req.body || {};


            if (
                !studentId ||
                !subject ||
                ca === undefined ||
                exam === undefined ||
                !total ||
                !grade ||
                !term ||
                !session
            ) {
                return res.status(400).json({
                    message: "All result fields are required"
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


            const existingResult = await Result.findOne({
                studentId,
                subject,
                term,
                session
            });

            if (existingResult) {
                return res.status(400).json({
                    message:
                        "A result for this subject, term and session already exists"
                });
            }


            const result = await Result.create({
                studentId,
                subject,
                ca,
                exam,
                total,
                grade,
                term,
                session
            });


            res.status(201).json({
                message: "Result recorded successfully",
                result
            });

        } catch (error) {

            console.error(
                "Record result error:",
                error.message
            );

            res.status(500).json({
                message: "Server error while recording result"
            });
        }
    }
);


// ========================================
// STUDENT: VIEW OWN RESULTS
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


            const user = await User.findById(
                req.user.userId
            );


            if (!user) {
                return res.status(404).json({
                    message: "User account not found"
                });
            }


            if (!user.studentId) {
                return res.status(400).json({
                    message:
                        "This account is not linked to a student record"
                });
            }


            const results = await Result.find({
                studentId: user.studentId
            }).sort({
                session: -1,
                term: 1,
                subject: 1
            });


            res.json({
                studentId: user.studentId,
                results
            });

        } catch (error) {

            console.error(
                "Get student results error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while retrieving results"
            });
        }
    }
);

// ========================================
// ADMIN: VIEW ALL RESULTS
// ========================================

router.get(
    "/history",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const results = await Result.find().sort({
                session: -1,
                term: 1,
                createdAt: -1
            });

            const students = await Student.find();

            const studentMap = new Map(
                students.map(student => [
                    student.studentId,
                    student
                ])
            );

            const resultHistory = results.map(result => {
                const student = studentMap.get(
                    result.studentId
                );

                return {
                    _id: result._id,
                    studentId: result.studentId,
                    studentName: student
                        ? `${student.firstName} ${student.surname}`
                        : "Unknown Student",
                    studentClass: student
                        ? student.studentClass
                        : "-",
                    subject: result.subject,
                    ca: result.ca,
                    exam: result.exam,
                    total: result.total,
                    grade: result.grade,
                    term: result.term,
                    session: result.session
                };
            });

            res.json({
                results: resultHistory
            });

        } catch (error) {

            console.error(
                "Get result history error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while retrieving result history"
            });
        }
    }
);

module.exports = router;