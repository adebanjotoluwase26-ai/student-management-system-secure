const adminToken =
    localStorage.getItem("adminToken");

const selectedStudentId =
    localStorage.getItem(
        "adminSelectedStudentId"
    );

const editStudentForm =
    document.getElementById("editStudentForm");

const studentTitle =
    document.getElementById("studentTitle");

const message =
    document.getElementById("message");


// ========================================
// CHECK ADMIN LOGIN
// ========================================

if (!adminToken) {
    window.location.href = "admin-login.html";
}


// ========================================
// CHECK SELECTED STUDENT
// ========================================

if (!selectedStudentId) {
    window.location.href = "admin-students.html";
}


// ========================================
// GET ALL STUDENTS
// ========================================

async function loadStudent() {

    try {

        const response = await fetch(
            "${window.API_BASE_URL}/api/admin/students",
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
                "Unable to load student.";

            return;
        }


        const student =
            data.students.find(
                student =>
                    student.studentId ===
                    selectedStudentId
            );


        if (!student) {

            studentTitle.textContent =
                "Student not found";

            return;
        }


        // ========================================
        // FILL FORM
        // ========================================

        studentTitle.textContent =
            `Edit: ${student.firstName} ${student.surname}`;


        document.getElementById(
            "firstName"
        ).value =
            student.firstName || "";


        document.getElementById(
            "surname"
        ).value =
            student.surname || "";


        document.getElementById(
            "studentClass"
        ).value =
            student.studentClass || "";


        document.getElementById(
            "gender"
        ).value =
            student.gender || "";


        document.getElementById(
            "dob"
        ).value =
            student.dob || "";


        document.getElementById(
            "phoneNo"
        ).value =
            student.phoneNo || "";


        document.getElementById(
            "email"
        ).value =
            student.email || "";


        document.getElementById(
            "homeAddress"
        ).value =
            student.homeAddress || "";


        // ========================================
        // SELECT EXISTING SUBJECTS
        // ========================================

        const subjects =
            student.subjects || [];


        const subjectCheckboxes =
            document.querySelectorAll(
                'input[name="subjects"]'
            );


        subjectCheckboxes.forEach(
            checkbox => {

                checkbox.checked =
                    subjects.includes(
                        checkbox.value
                    );
            }
        );


    } catch (error) {

        console.error(
            "Load student error:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";
    }
}


// ========================================
// SAVE CHANGES
// ========================================

editStudentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        message.textContent =
            "Saving changes...";


        const subjects =
            Array.from(
                document.querySelectorAll(
                    'input[name="subjects"]:checked'
                )
            ).map(
                checkbox => checkbox.value
            );


        const updatedStudent = {

            firstName:
                document.getElementById(
                    "firstName"
                ).value.trim(),

            surname:
                document.getElementById(
                    "surname"
                ).value.trim(),

            studentClass:
                document.getElementById(
                    "studentClass"
                ).value,

            gender:
                document.getElementById(
                    "gender"
                ).value,

            dob:
                document.getElementById(
                    "dob"
                ).value,

            phoneNo:
                document.getElementById(
                    "phoneNo"
                ).value.trim(),

            email:
                document.getElementById(
                    "email"
                ).value.trim(),

            password:
                document.getElementById(
                    "password"
                ).value,

            homeAddress:
                document.getElementById(
                    "homeAddress"
                ).value.trim(),

            subjects
        };


        try {

            const response = await fetch(
                `${window.API_BASE_URL}/api/admin/students/${selectedStudentId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${adminToken}`
                    },

                    body:
                        JSON.stringify(
                            updatedStudent
                        )
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Unable to update student.";

                return;
            }


            message.textContent =
                "Student updated successfully!";


            // Return to profile after saving
            setTimeout(() => {

                window.location.href =
                    "admin-student-profile.html";

            }, 700);


        } catch (error) {

            console.error(
                "Update student error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";
        }
    }
);


// Load selected student
loadStudent();