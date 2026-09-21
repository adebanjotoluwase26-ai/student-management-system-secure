const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const Student = require("../models/Student");
const Result = require("../models/Result");
const Attendance = require("../models/Attendance");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ========================================
// ADMIN DASHBOARD TEST
// ========================================

router.get(
    "/dashboard",
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        res.json({
            message: "Welcome to the admin dashboard",
            userId: req.user.userId,
            role: req.user.role
        });
    }
);

// ========================================
// ADMIN: CREATE STUDENT
// ========================================

router.post(
    "/students",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const {
                firstName,
                surname,
                studentClass,
                homeAddress,
                email,
                password,
                dob,
                gender,
                phoneNo,
                subjects
            } = req.body || {};


            // Required student information
            if (
                !firstName ||
                !surname ||
                !studentClass
            ) {
                return res.status(400).json({
                    message:
                        "First name, surname and class are required"
                });
            }


            // Check email only when one is supplied
            if (email) {

                const existingUser =
                    await User.findOne({
                        email: email.toLowerCase()
                    });

                if (existingUser) {
                    return res.status(400).json({
                        message:
                            "Email is already registered"
                    });
                }
            }


            // Generate Student ID
            const studentCount =
                await Student.countDocuments();

            const studentNumber =
                studentCount + 1;

            const studentId =
                `STU-${new Date().getFullYear()}-${String(studentNumber).padStart(3, "0")}`;


            // Make sure Student ID is unique
            const existingStudent =
                await Student.findOne({
                    studentId
                });

            if (existingStudent) {
                return res.status(400).json({
                    message:
                        "Student ID already exists. Please try again."
                });
            }


            // Create student record
            const student =
                await Student.create({
                    studentId,
                    firstName,
                    surname,
                    studentClass,
                    homeAddress: homeAddress || "",
                    email: email
                        ? email.toLowerCase()
                        : "",
                    dob: dob || "",
                    gender: gender || "",
                    phoneNo: phoneNo || "",
                    subjects:
                        Array.isArray(subjects)
                            ? subjects
                            : []
                });


            // ========================================
            // CREATE ACTIVATION CODE
            // ========================================

            const activationCode =
                crypto
                    .randomBytes(4)
                    .toString("hex")
                    .toUpperCase();


            const activationCodeHash =
                await bcrypt.hash(
                    activationCode,
                    10
                );


            const activationExpiresAt =
                new Date(
                    Date.now() +
                    24 * 60 * 60 * 1000
                );


            // ========================================
            // CREATE USER ACCOUNT
            // ========================================

            const userData = {
                name: `${firstName} ${surname}`,

                role: "student",

                studentId: student.studentId,

                accountStatus:
                    "pending",

                activationCodeHash,

                activationExpiresAt,

                activatedAt: null
            };


            // Support students who already have email/password
            if (email) {
                userData.email =
                    email.toLowerCase();
            }

            if (password) {
                userData.password =
                    await bcrypt.hash(
                        password,
                        10
                    );

                userData.accountStatus =
                    "active";

                userData.activationCodeHash =
                    null;

                userData.activationExpiresAt =
                    null;

                userData.activatedAt =
                    new Date();
            }


            const user =
                await User.create(
                    userData
                );


            res.status(201).json({

                message:
                    password && email
                        ? "Student account created successfully"
                        : "Student created successfully. Activation code generated.",

                student: {
                    id: student._id,
                    studentId:
                        student.studentId,
                    firstName:
                        student.firstName,
                    surname:
                        student.surname,
                    studentClass:
                        student.studentClass,
                    email:
                        student.email
                },

                user: {
                    id: user._id,
                    role: user.role,
                    studentId:
                        user.studentId,
                    accountStatus:
                        user.accountStatus
                },

                activation:
                    password && email
                        ? null
                        : {
                            code:
                                activationCode,
                            expiresAt:
                                activationExpiresAt
                        }

            });

        } catch (error) {

            console.error(
                "Create student error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while creating student"
            });
        }
    }
);

// ========================================
// ADMIN: GET ALL STUDENTS
// ========================================

router.get(
    "/students",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const students = await Student.find().sort({
                firstName: 1,
                surname: 1
            });

            res.json({
                students
            });

        } catch (error) {
            console.error(
                "Get students error:",
                error.message
            );

            res.status(500).json({
                message: "Server error while retrieving students"
            });
        }
    }
);

// ========================================
// ADMIN: EDIT STUDENT
// ========================================

router.put(
    "/students/:studentId",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { studentId } = req.params;

            const {
                firstName,
                surname,
                studentClass,
                homeAddress,
                email,
                password,
                dob,
                gender,
                phoneNo,
                subjects
            } = req.body || {};


            const student = await Student.findOne({
                studentId
            });

            if (!student) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }


            // Check if a new email belongs to another account
            if (email && email.toLowerCase() !== student.email) {

                const existingUser = await User.findOne({
                    email: email.toLowerCase()
                });

                if (
                    existingUser &&
                    existingUser.studentId !== studentId
                ) {
                    return res.status(400).json({
                        message: "Email is already in use"
                    });
                }
            }


            // Update student record
            student.firstName =
                firstName ?? student.firstName;

            student.surname =
                surname ?? student.surname;

            student.studentClass =
                studentClass ?? student.studentClass;

            student.homeAddress =
                homeAddress ?? student.homeAddress;

            student.email =
                email
                    ? email.toLowerCase()
                    : student.email;

            student.dob =
                dob ?? student.dob;

            student.gender =
                gender ?? student.gender;

            student.phoneNo =
                phoneNo ?? student.phoneNo;

            student.subjects =
                Array.isArray(subjects)
                    ? subjects
                    : student.subjects;


            await student.save();


            // Find linked login account
            const user = await User.findOne({
                studentId
            });


            if (user) {

                user.name =
                    `${student.firstName} ${student.surname}`;

                user.email =
                    student.email;


                // Change password only if one was provided
                if (
                    password &&
                    password.trim() !== ""
                ) {
                    user.password =
                        await bcrypt.hash(
                            password,
                            10
                        );
                }


                await user.save();
            }


            res.json({
                message: "Student updated successfully",
                student
            });


        } catch (error) {

            console.error(
                "Edit student error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while updating student"
            });
        }
    }
);

// ========================================
// ADMIN: DELETE STUDENT
// ========================================

router.delete(
    "/students/:studentId",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { studentId } = req.params;

            const student = await Student.findOne({
                studentId
            });

            if (!student) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }


            // Delete linked login account
            await User.deleteOne({
                studentId
            });


            // Delete attendance records
            await Attendance.deleteMany({
                studentId
            });


            // Delete result records
            await Result.deleteMany({
                studentId
            });


            // Delete student record
            await Student.deleteOne({
                studentId
            });


            res.json({
                message: "Student and linked records deleted successfully"
            });

        } catch (error) {

            console.error(
                "Delete student error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while deleting student"
            });
        }
    }
);

// ========================================
// ADMIN: GENERATE NEW ACTIVATION CODE
// ========================================

router.post(
    "/students/:studentId/activation-code",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { studentId } = req.params;

            const user = await User.findOne({
                studentId,
                role: "student"
            });

            if (!user) {
                return res.status(404).json({
                    message: "Student account not found"
                });
            }

            if (user.accountStatus === "active") {
                return res.status(400).json({
                    message:
                        "This student account is already active"
                });
            }

            const activationCode =
                crypto
                    .randomBytes(4)
                    .toString("hex")
                    .toUpperCase();

            user.activationCodeHash =
                await bcrypt.hash(
                    activationCode,
                    10
                );

            user.activationExpiresAt =
                new Date(
                    Date.now() +
                    24 * 60 * 60 * 1000
                );

            await user.save();

            res.json({
                message:
                    "New activation code generated successfully",
                studentId,
                activation: {
                    code: activationCode,
                    expiresAt:
                        user.activationExpiresAt
                }
            });

        } catch (error) {

            console.error(
                "Generate activation code error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while generating activation code"
            });
        }
    }
);

// ========================================
// ADMIN: RESET STUDENT PASSWORD
// ========================================

router.post(
    "/students/:studentId/reset-password",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { studentId } = req.params;
            const { newPassword } = req.body || {};

            if (!newPassword) {
                return res.status(400).json({
                    message:
                        "New password is required"
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
                role: "student"
            });

            if (!user) {
                return res.status(404).json({
                    message:
                        "Student account not found"
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
                    "Student password reset successfully"
            });

        } catch (error) {

            console.error(
                "Admin password reset error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while resetting student password"
            });
        }
    }
);

// ========================================
// ADMIN: DEACTIVATE STUDENT ACCOUNT
// ========================================

router.put(
    "/students/:studentId/deactivate",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { studentId } = req.params;

            const user = await User.findOne({
                studentId,
                role: "student"
            });

            if (!user) {
                return res.status(404).json({
                    message: "Student account not found"
                });
            }

            if (user.accountStatus === "deactivated") {
                return res.status(400).json({
                    message: "Student account is already deactivated"
                });
            }

            user.accountStatus = "deactivated";

            await user.save();

            res.json({
                message: "Student account deactivated successfully"
            });

        } catch (error) {
            console.error(
                "Deactivate account error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while deactivating student account"
            });
        }
    }
);


// ========================================
// ADMIN: REACTIVATE STUDENT ACCOUNT
// ========================================

router.put(
    "/students/:studentId/reactivate",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { studentId } = req.params;

            const user = await User.findOne({
                studentId,
                role: "student"
            });

            if (!user) {
                return res.status(404).json({
                    message: "Student account not found"
                });
            }

            if (user.accountStatus === "active") {
                return res.status(400).json({
                    message: "Student account is already active"
                });
            }

            if (user.accountStatus === "pending") {
                return res.status(400).json({
                    message:
                        "Student account has not been activated yet"
                });
            }

            user.accountStatus = "active";

            await user.save();

            res.json({
                message: "Student account reactivated successfully"
            });

        } catch (error) {
            console.error(
                "Reactivate account error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while reactivating student account"
            });
        }
    }
);

// ========================================
// ADMIN: GET STUDENT ACCOUNT STATUS
// ========================================

router.get(
    "/students/:studentId/account-status",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { studentId } = req.params;

            const user = await User.findOne({
                studentId,
                role: "student"
            });

            if (!user) {
                return res.status(404).json({
                    message: "Student account not found"
                });
            }

            res.json({
                studentId: user.studentId,
                accountStatus: user.accountStatus
            });

        } catch (error) {
            console.error(
                "Get account status error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while retrieving account status"
            });
        }
    }
);
// ========================================
// ADMIN: VIEW COMPLETE STUDENT RECORD
// ========================================

router.get(
    "/students/:studentId/records",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { studentId } = req.params;

            const student = await Student.findOne({
                studentId
            });

            if (!student) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }

            const user = await User.findOne({
                studentId,
                role: "student"
            });

            const attendance = await Attendance.find({
                studentId
            }).sort({
                date: -1
            });

            const results = await Result.find({
                studentId
            }).sort({
                session: -1,
                term: 1,
                subject: 1
            });

            const totalAttendance =
                attendance.length;

            const presentCount =
                attendance.filter(
                    record =>
                        record.status === "Present"
                ).length;

            const absentCount =
                attendance.filter(
                    record =>
                        record.status === "Absent"
                ).length;

            const attendanceRate =
                totalAttendance > 0
                    ? (
                        presentCount /
                        totalAttendance
                    ) * 100
                    : 0;

            const totalResults =
                results.length;

            const totalMarks =
                results.reduce(
                    (sum, result) =>
                        sum + Number(result.total),
                    0
                );

            const averageMark =
                totalResults > 0
                    ? totalMarks / totalResults
                    : 0;

            res.json({

                student: {
                    studentId: student.studentId,
                    firstName: student.firstName,
                    surname: student.surname,
                    studentClass:
                        student.studentClass,
                    homeAddress:
                        student.homeAddress,
                    email: student.email,
                    dob: student.dob,
                    gender: student.gender,
                    phoneNo: student.phoneNo,
                    subjects:
                        student.subjects || []
                },

                account: {
                    status:
                        user
                            ? user.accountStatus
                            : "No account"
                },

                attendance: {
                    records: attendance,
                    total:
                        totalAttendance,
                    present:
                        presentCount,
                    absent:
                        absentCount,
                    rate:
                        Number(
                            attendanceRate.toFixed(1)
                        )
                },

                results: {
                    records: results,
                    totalSubjects:
                        totalResults,
                    totalMarks:
                        totalMarks,
                    average:
                        Number(
                            averageMark.toFixed(1)
                        )
                }

            });

        } catch (error) {

            console.error(
                "Get complete student record error:",
                error.message
            );

            res.status(500).json({
                message:
                    "Server error while retrieving student records"
            });
        }
    }
);

module.exports = router;