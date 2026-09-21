const adminToken = localStorage.getItem("adminToken");

const studentForm =
    document.getElementById("studentForm");

const message =
    document.getElementById("message");

const activationBox =
    document.getElementById("activationBox");

const activationStudentId =
    document.getElementById("activationStudentId");

const activationCode =
    document.getElementById("activationCode");

const activationExpiry =
    document.getElementById("activationExpiry");

const studentsTable =
    document.getElementById("studentsTable");


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

        studentsTable.innerHTML = "";

        if (data.students.length === 0) {
            studentsTable.innerHTML = `
                <tr>
                    <td colspan="4" style="padding: 15px; text-align: center;">
                        No students registered yet.
                    </td>
                </tr>
            `;

            return;
        }


        data.students.forEach((student) => {

            const row =
                document.createElement("tr");


            const studentIdCell =
                document.createElement("td");

            studentIdCell.textContent =
                student.studentId;

            studentIdCell.style.padding =
                "10px";

            studentIdCell.style.borderBottom =
                "1px solid #ddd";


            const nameCell =
                document.createElement("td");

            nameCell.textContent =
                `${student.firstName} ${student.surname}`;

            nameCell.style.padding =
                "10px";

            nameCell.style.borderBottom =
                "1px solid #ddd";


            const classCell =
                document.createElement("td");

            classCell.textContent =
                student.studentClass;

            classCell.style.padding =
                "10px";

            classCell.style.borderBottom =
                "1px solid #ddd";

            const emailCell =
                document.createElement("td");

            emailCell.textContent =
                student.email || "-";

            emailCell.style.padding =
                "10px";

            emailCell.style.borderBottom =
                "1px solid #ddd";


            const actionCell =
                document.createElement("td");

            actionCell.style.padding =
                "10px";

            actionCell.style.borderBottom =
                "1px solid #ddd";


            const viewButton =
                document.createElement("button");

            viewButton.textContent =
                "View";

            viewButton.type =
                "button";

            viewButton.style.padding =
                "8px 12px";

            viewButton.style.cursor =
                "pointer";


            viewButton.addEventListener(
                "click",
                function () {

                    localStorage.setItem(
                        "adminSelectedStudentId",
                        student.studentId
                    );

                    window.location.href =
                        "admin-student-profile.html";
                }
            );


            actionCell.appendChild(viewButton);


            row.appendChild(studentIdCell);
            row.appendChild(nameCell);
            row.appendChild(classCell);
            row.appendChild(emailCell);
            row.appendChild(actionCell);

            studentsTable.appendChild(row);
            
        });

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
// CREATE STUDENT
// ========================================

studentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        message.textContent =
            "Creating student...";


        const studentData = {

            firstName:
                document.getElementById("firstName")
                    .value.trim(),

            surname:
                document.getElementById("surname")
                    .value.trim(),

            studentClass:
                document.getElementById("studentClass")
                    .value,

            gender:
                document.getElementById("gender")
                    .value,

            dob:
                document.getElementById("dob")
                    .value,

            phoneNo:
                document.getElementById("phoneNo")
                    .value.trim(),

            email:
                document.getElementById("email")
                    .value.trim(),

            password:
                document.getElementById("password")
                    .value,

            homeAddress:
                document.getElementById("homeAddress")
                    .value.trim(),

            subjects: Array.from(
                document.querySelectorAll(
                    'input[name="subjects"]:checked'
                )
            ).map(
                checkbox => checkbox.value
            )
        };


        try {

            const response = await fetch(
                `${window.API_BASE_URL}/api/admin/students`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${adminToken}`
                    },

                    body: JSON.stringify(studentData)
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Unable to create student.";

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


            message.textContent =
                data.message;

            if (data.activation) {

                activationStudentId.textContent =
                    data.student.studentId;

                activationCode.textContent =
                    data.activation.code;

                activationExpiry.textContent =
                    new Date(
                        data.activation.expiresAt
                    ).toLocaleString();

                activationBox.style.display =
                    "block";

            } else {

                activationBox.style.display =
                    "none";
            }


            studentForm.reset();


            // Reload student list
            loadStudents();

        } catch (error) {

            console.error(
                "Create student error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";
        }
    }
);


// Load students when page opens
loadStudents();