const adminToken = localStorage.getItem("adminToken");

const attendanceForm =
    document.getElementById("attendanceForm");

const studentSelect =
    document.getElementById("studentId");

const dateInput =
    document.getElementById("date");

const statusSelect =
    document.getElementById("status");

const message =
    document.getElementById("message");


if (!adminToken) {
    window.location.href = "admin-login.html";
}


// ========================================
// SET TODAY'S DATE
// ========================================

const today =
    new Date().toISOString().split("T")[0];

dateInput.value = today;


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

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");

                window.location.href =
                    "admin-login.html";
            }

            return;
        }


        studentSelect.innerHTML = `
            <option value="">
                Select Student
            </option>
        `;


        data.students.forEach(
            (student) => {

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
// RECORD ATTENDANCE
// ========================================

attendanceForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const attendanceData = {
            studentId:
                studentSelect.value,

            date:
                dateInput.value,

            status:
                statusSelect.value
        };


        if (
            !attendanceData.studentId ||
            !attendanceData.date ||
            !attendanceData.status
        ) {
            message.textContent =
                "Please complete all attendance fields.";

            return;
        }


        message.textContent =
            "Recording attendance...";


        try {

            const response = await fetch(
                `${window.API_BASE_URL}/api/attendance`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${adminToken}`
                    },

                    body:
                        JSON.stringify(
                            attendanceData
                        )
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Unable to record attendance.";

                return;
            }


            message.textContent =
                `Attendance recorded successfully for ${attendanceData.studentId}.`;

            studentSelect.value = "";
            statusSelect.value = "";

        } catch (error) {

            console.error(
                "Record attendance error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";
        }
    }
);


loadStudents();