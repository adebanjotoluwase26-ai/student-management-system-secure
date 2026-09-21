const adminToken =
    localStorage.getItem("adminToken");

const studentSelect =
    document.getElementById("studentSelect");

const message =
    document.getElementById("message");

const studentProfile =
    document.getElementById("studentProfile");

const attendanceSection =
    document.getElementById("attendanceSection");

const resultsSection =
    document.getElementById("resultsSection");


// ========================================
// CHECK ADMIN LOGIN
// ========================================

if (!adminToken) {
    window.location.href = "admin-login.html";
}


// ========================================
// LOAD STUDENTS
// ========================================

async function loadStudents() {

    try {

        const response = await fetch(
            `${window.API_BASE_URL}/api/admin/students`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${adminToken}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Unable to load students.";

            return;
        }


        data.students.forEach(
            student => {

                const option =
                    document.createElement("option");

                option.value =
                    student.studentId;

                option.textContent =
                    `${student.studentId} - ${student.firstName} ${student.surname} (${student.studentClass})`;

                studentSelect.appendChild(
                    option
                );
            }
        );

    } catch (error) {

        console.error(
            "Load students error:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";
    }
}


// ========================================
// LOAD COMPLETE STUDENT RECORD
// ========================================

async function loadStudentRecords(studentId) {

    if (!studentId) {

        studentProfile.style.display =
            "none";

        attendanceSection.style.display =
            "none";

        resultsSection.style.display =
            "none";

        message.textContent = "";

        return;
    }


    message.textContent =
        "Loading student records...";


    try {

        const response = await fetch(
            `${window.API_BASE_URL}/api/admin/students/${studentId}/records`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${adminToken}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Unable to load student records.";

            return;
        }


        // ========================================
        // PROFILE
        // ========================================

        studentProfile.style.display =
            "block";

        attendanceSection.style.display =
            "block";

        resultsSection.style.display =
            "block";


        document.getElementById(
            "studentName"
        ).textContent =
            `${data.student.firstName} ${data.student.surname}`;


        document.getElementById(
            "studentId"
        ).textContent =
            data.student.studentId;


        document.getElementById(
            "studentClass"
        ).textContent =
            data.student.studentClass || "-";


        document.getElementById(
            "studentEmail"
        ).textContent =
            data.student.email || "-";


        document.getElementById(
            "accountStatus"
        ).textContent =
            data.account.status;


        document.getElementById(
            "studentGender"
        ).textContent =
            data.student.gender || "-";


        document.getElementById(
            "studentPhone"
        ).textContent =
            data.student.phoneNo || "-";


        document.getElementById(
            "studentSubjects"
        ).textContent =
            data.student.subjects &&
            data.student.subjects.length > 0
                ? data.student.subjects.join(", ")
                : "No subjects assigned";


        // ========================================
        // ATTENDANCE SUMMARY
        // ========================================

        document.getElementById(
            "attendanceTotal"
        ).textContent =
            data.attendance.total;


        document.getElementById(
            "attendancePresent"
        ).textContent =
            data.attendance.present;


        document.getElementById(
            "attendanceAbsent"
        ).textContent =
            data.attendance.absent;


        document.getElementById(
            "attendanceRate"
        ).textContent =
            `${data.attendance.rate}%`;


        const attendanceTable =
            document.getElementById(
                "attendanceTable"
            );

        attendanceTable.innerHTML = "";


        if (
            data.attendance.records.length === 0
        ) {

            attendanceTable.innerHTML = `
                <tr>
                    <td colspan="2">
                        No attendance records found.
                    </td>
                </tr>
            `;

        } else {

            data.attendance.records.forEach(
                record => {

                    const row =
                        document.createElement("tr");


                    const dateCell =
                        document.createElement("td");

                    dateCell.textContent =
                        record.date;


                    const statusCell =
                        document.createElement("td");

                    statusCell.textContent =
                        record.status;


                    row.appendChild(
                        dateCell
                    );

                    row.appendChild(
                        statusCell
                    );

                    attendanceTable.appendChild(
                        row
                    );
                }
            );
        }


        // ========================================
        // RESULTS SUMMARY
        // ========================================

        document.getElementById(
            "resultCount"
        ).textContent =
            data.results.totalSubjects;


        document.getElementById(
            "resultTotal"
        ).textContent =
            data.results.totalMarks;


        document.getElementById(
            "resultAverage"
        ).textContent =
            `${data.results.average}%`;


        const resultSession =
            data.results.records.length > 0
                ? data.results.records[0].session
                : "-";


        document.getElementById(
            "resultSession"
        ).textContent =
            resultSession;


        const resultsTable =
            document.getElementById(
                "resultsTable"
            );

        resultsTable.innerHTML = "";


        if (
            data.results.records.length === 0
        ) {

            resultsTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        No result records found.
                    </td>
                </tr>
            `;

        } else {

            data.results.records.forEach(
                result => {

                    const row =
                        document.createElement("tr");


                    const values = [
                        result.subject,
                        result.ca,
                        result.exam,
                        result.total,
                        result.grade,
                        result.term,
                        result.session
                    ];


                    values.forEach(
                        value => {

                            const cell =
                                document.createElement("td");

                            cell.textContent =
                                value;

                            row.appendChild(
                                cell
                            );
                        }
                    );


                    resultsTable.appendChild(
                        row
                    );
                }
            );
        }


        message.textContent = "";

    } catch (error) {

        console.error(
            "Student records error:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";
    }
}


// ========================================
// STUDENT SELECTION
// ========================================

studentSelect.addEventListener(
    "change",
    function () {

        loadStudentRecords(
            studentSelect.value
        );
    }
);


loadStudents();