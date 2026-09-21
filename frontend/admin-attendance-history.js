const adminToken = localStorage.getItem("adminToken");

const attendanceTable =
    document.getElementById("attendanceTable");

const message =
    document.getElementById("message");


// ========================================
// CHECK ADMIN LOGIN
// ========================================

if (!adminToken) {
    window.location.href = "admin-login.html";
}


// ========================================
// LOAD ATTENDANCE HISTORY
// ========================================

async function loadAttendanceHistory() {

    try {

        const response = await fetch(
            `${window.API_BASE_URL}/api/attendance/history`,
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
                "Unable to load attendance history.";

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "adminToken"
                );

                localStorage.removeItem(
                    "adminUser"
                );

                window.location.href =
                    "admin-login.html";
            }

            return;
        }


        attendanceTable.innerHTML = "";


        if (
            !data.records ||
            data.records.length === 0
        ) {

            attendanceTable.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="
                            padding: 15px;
                            text-align: center;
                        "
                    >
                        No attendance records found.
                    </td>
                </tr>
            `;

            message.textContent = "";

            return;
        }


        data.records.forEach(
            (record, index) => {

                const row =
                    document.createElement("tr");


                const values = [
                    index + 1,
                    record.studentId,
                    record.studentName,
                    record.studentClass,
                    record.date,
                    record.status
                ];


                values.forEach(
                    (value) => {

                        const cell =
                            document.createElement("td");

                        cell.textContent =
                            value;

                        cell.style.padding =
                            "12px";

                        cell.style.borderBottom =
                            "1px solid #ddd";

                        row.appendChild(
                            cell
                        );
                    }
                );


                attendanceTable.appendChild(
                    row
                );
            }
        );


        message.textContent = "";


    } catch (error) {

        console.error(
            "Attendance history error:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";
    }
}


loadAttendanceHistory();