const token = localStorage.getItem("token");

const message =
    document.getElementById("message");

const studentName =
    document.getElementById("studentName");

const studentId =
    document.getElementById("studentId");

const fullName =
    document.getElementById("fullName");

const studentClass =
    document.getElementById("studentClass");

const studentEmail =
    document.getElementById("studentEmail");

const studentGender =
    document.getElementById("studentGender");

const studentPhone =
    document.getElementById("studentPhone");

const logoutButton =
    document.getElementById("logoutButton");


// ========================================
// CHECK LOGIN
// ========================================

if (!token) {
    window.location.href = "login.html";
}


// ========================================
// LOAD STUDENT PROFILE
// ========================================

async function loadStudentProfile() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/students/me`,
            {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Unable to load profile.";


            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href =
                    "login.html";
            }

            return;
        }


        const student =
            data.student;


        const name =
            `${student.firstName} ${student.surname}`;


        studentName.textContent =
            student.firstName;

        studentId.textContent =
            student.studentId;

        fullName.textContent =
            name;

        studentClass.textContent =
            student.studentClass || "-";

        studentEmail.textContent =
            student.email || "-";

        studentGender.textContent =
            student.gender || "-";

        studentPhone.textContent =
            student.phoneNo || "-";


        message.textContent =
            "Your account is active.";

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";
    }
}


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "login.html";
    }
);


loadStudentProfile();