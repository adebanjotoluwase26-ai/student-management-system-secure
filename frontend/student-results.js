const token = localStorage.getItem("token");

const studentIdElement =
    document.getElementById("studentId");

const subjectCountElement =
    document.getElementById("subjectCount");

const totalMarksElement =
    document.getElementById("totalMarks");

const averageMarkElement =
    document.getElementById("averageMark");

const resultsTable =
    document.getElementById("resultsTable");

const message =
    document.getElementById("message");


// ========================================
// CHECK LOGIN
// ========================================

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// LOAD STUDENT RESULTS
// ========================================

async function loadResults() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/results/me`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent =
                data.message || "Unable to load results.";

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href = "login.html";
            }

            return;
        }


        const results = data.results || [];


        // Student ID
        studentIdElement.textContent =
            `Student ID: ${data.studentId}`;


        // Summary calculations
        const subjectCount = results.length;

        const totalMarks = results.reduce(
            (sum, result) => sum + Number(result.total),
            0
        );

        const averageMark =
            subjectCount > 0
                ? totalMarks / subjectCount
                : 0;


        subjectCountElement.textContent =
            subjectCount;

        totalMarksElement.textContent =
            totalMarks;

        averageMarkElement.textContent =
            `${averageMark.toFixed(1)}%`;


        // Clear table
        resultsTable.innerHTML = "";


        // No results
        if (results.length === 0) {
            resultsTable.innerHTML = `
                <tr>
                    <td colspan="8">
                        No results found.
                    </td>
                </tr>
            `;

            message.textContent = "";
            return;
        }


        // Display results
        results.forEach((result, index) => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${result.subject}</td>
                <td>${result.ca}</td>
                <td>${result.exam}</td>
                <td>${result.total}</td>
                <td>${result.grade}</td>
                <td>${result.term}</td>
                <td>${result.session}</td>
            `;

            resultsTable.appendChild(row);
        });


        message.textContent = "";

    } catch (error) {

        console.error(
            "Results loading error:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";
    }
}


loadResults();