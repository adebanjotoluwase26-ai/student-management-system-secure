const token = localStorage.getItem("token");

const studentIdElement =
    document.getElementById("studentId");

const totalDaysElement =
    document.getElementById("totalDays");

const presentDaysElement =
    document.getElementById("presentDays");

const absentDaysElement =
    document.getElementById("absentDays");

const attendanceRateElement =
    document.getElementById("attendanceRate");

const attendanceTable =
    document.getElementById("attendanceTable");


// ========================================
// CHECK LOGIN
// ========================================

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// LOAD ATTENDANCE
// ========================================

async function loadAttendance() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/attendance/me`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.message ||
                "Unable to load attendance."
            );

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href = "login.html";
            }

            return;
        }


        // Student ID
        studentIdElement.textContent =
            `Student ID: ${data.studentId}`;


        const records = data.records || [];


        // Attendance calculations
        const totalDays = records.length;

        const presentDays = records.filter(
            record => record.status === "Present"
        ).length;

        const absentDays = records.filter(
            record => record.status === "Absent"
        ).length;


        let attendanceRate = 0;

        if (totalDays > 0) {
            attendanceRate =
                (presentDays / totalDays) * 100;
        }


        // Display summary
        totalDaysElement.textContent =
            totalDays;

        presentDaysElement.textContent =
            presentDays;

        absentDaysElement.textContent =
            absentDays;

        attendanceRateElement.textContent =
            `Attendance Rate: ${attendanceRate.toFixed(1)}%`;


        // Clear table
        attendanceTable.innerHTML = "";


        // No records
        if (records.length === 0) {
            attendanceTable.innerHTML = `
                <tr>
                    <td colspan="3">
                        No attendance records found.
                    </td>
                </tr>
            `;

            return;
        }


        // Display records
        records.forEach((record, index) => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${record.date}</td>
                <td>${record.status}</td>
            `;

            attendanceTable.appendChild(row);
        });


    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );

        attendanceTable.innerHTML = `
            <tr>
                <td colspan="3">
                    Unable to connect to the server.
                </td>
            </tr>
        `;
    }
}


loadAttendance();