const adminToken = localStorage.getItem("adminToken");

const resultsTable =
    document.getElementById("resultsTable");

const message =
    document.getElementById("message");


// ========================================
// CHECK ADMIN LOGIN
// ========================================

if (!adminToken) {
    window.location.href = "admin-login.html";
}


// ========================================
// LOAD RESULT HISTORY
// ========================================

async function loadResultHistory() {
    try {
        const response = await fetch(
            `${window.API_BASE_URL}/api/results/history`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent =
                data.message ||
                "Unable to load result history.";

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

        resultsTable.innerHTML = "";

        if (!data.results || data.results.length === 0) {
            resultsTable.innerHTML = `
                <tr>
                    <td colspan="11"
                        style="padding: 15px; text-align: center;">
                        No result records found.
                    </td>
                </tr>
            `;

            message.textContent = "";
            return;
        }

        data.results.forEach((result, index) => {

            const row =
                document.createElement("tr");

            const values = [
                index + 1,
                result.studentId,
                result.studentName,
                result.studentClass,
                result.subject,
                result.ca,
                result.exam,
                result.total,
                result.grade,
                result.term,
                result.session
            ];

            values.forEach((value) => {

                const cell =
                    document.createElement("td");

                cell.textContent =
                    value;

                cell.style.padding =
                    "11px";

                cell.style.borderBottom =
                    "1px solid #ddd";

                row.appendChild(cell);
            });

            resultsTable.appendChild(row);
        });

        message.textContent = "";

    } catch (error) {

        console.error(
            "Result history error:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";
    }
}


loadResultHistory();