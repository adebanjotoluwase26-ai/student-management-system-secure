const adminToken = localStorage.getItem("adminToken");

const resultForm =
    document.getElementById("resultForm");

const studentSelect =
    document.getElementById("studentId");

const message =
    document.getElementById("message");

const subjectSelect =
    document.getElementById("subject");

let allStudents = [];

const allSubjects = [
    "Mathematics",
    "English",
    "Civic Education",
    "Biology",
    "Chemistry",
    "Physics",
    "Further Mathematics",
    "Government",
    "Literature-in-English",
    "History",
    "CRS",
    "Economics",
    "Financial Accounting",
    "Commerce",
    "Book Keeping",
    "Marketing"
];

// ========================================
// CHECK ADMIN LOGIN
// ========================================

if (!adminToken) {
    window.location.href = "admin-login.html";
}


// ========================================
// LOAD ALL STUDENTS
// ========================================

async function loadStudents() {
    try {
        const response = await fetch(
            `${window.API_BASE_URL}/api/admin/students`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        const data = await response.json();
            allStudents = data.students;

        if (!response.ok) {
            message.textContent =
                data.message || "Unable to load students.";

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");

                window.location.href = "admin-login.html";
            }

            return;
        }

        studentSelect.innerHTML = `
            <option value="">
                Select Student
            </option>
        `;

        data.students.forEach((student) => {
            const option = document.createElement("option");

            option.value = student.studentId;

            option.textContent =
                `${student.studentId} - ${student.firstName} ${student.surname} (${student.studentClass})`;

            studentSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Load students error:", error);

        message.textContent =
            "Unable to connect to the server.";
    }
}

// ========================================
// UPDATE SUBJECTS BASED ON SELECTED STUDENT
// ========================================

function updateSubjects() {

    const selectedStudentId =
        studentSelect.value;

    subjectSelect.innerHTML = `
        <option value="">
            Select Subject
        </option>
    `;

    if (!selectedStudentId) {
        return;
    }

    const selectedStudent =
        allStudents.find(
            student =>
                student.studentId ===
                selectedStudentId
        );

    if (!selectedStudent) {
        return;
    }


    const studentSubjects =
        selectedStudent.subjects || [];


    // Student has assigned subjects
    if (studentSubjects.length > 0) {

        studentSubjects.forEach((subject) => {

            const option =
                document.createElement("option");

            option.value = subject;
            option.textContent = subject;

            subjectSelect.appendChild(option);
        });

        return;
    }


    // No subjects assigned yet
    const notice =
        document.createElement("option");

    notice.value = "";

    notice.textContent =
        "No subjects assigned";

    notice.disabled = true;

    subjectSelect.appendChild(notice);
}

studentSelect.addEventListener(
    "change",
    updateSubjects
);
// ========================================
// CALCULATE GRADE
// ========================================

function calculateGrade(total) {

    if (total >= 70) {
        return "A";
    }

    if (total >= 60) {
        return "B";
    }

    if (total >= 50) {
        return "C";
    }

    if (total >= 45) {
        return "D";
    }

    if (total >= 40) {
        return "E";
    }

    return "F";
}


// ========================================
// RECORD RESULT
// ========================================

resultForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        message.textContent =
            "Recording result...";


        const studentId =
            studentSelect.value;

        const subject =
            document.getElementById("subject").value.trim();

        const ca =
            Number(document.getElementById("ca").value);

        const exam =
            Number(document.getElementById("exam").value);

        const term =
            document.getElementById("term").value;

        const session =
            document.getElementById("session").value.trim();


        // Validate marks
        if (ca < 0 || ca > 40) {
            message.textContent =
                "CA must be between 0 and 40.";

            return;
        }

        if (exam < 0 || exam > 60) {
            message.textContent =
                "Exam must be between 0 and 60.";

            return;
        }


        const total = ca + exam;

        const grade =
            calculateGrade(total);


        const resultData = {
            studentId,
            subject,
            ca,
            exam,
            total,
            grade,
            term,
            session
        };


        try {

            const response = await fetch(
                `${window.API_BASE_URL}/api/results`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${adminToken}`
                    },

                    body: JSON.stringify(resultData)
                }
            );


            const data =
                await response.json();


            if (!response.ok) {
                message.textContent =
                    data.message ||
                    "Unable to record result.";

                return;
            }


            message.textContent =
                `Result recorded successfully for ${studentId}. Total: ${total}, Grade: ${grade}`;


            resultForm.reset();

        } catch (error) {

            console.error(
                "Record result error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";
        }
    }
);


// Load students when page opens
loadStudents();