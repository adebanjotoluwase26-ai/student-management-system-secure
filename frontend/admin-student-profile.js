const adminToken =
    localStorage.getItem("adminToken");

const selectedStudentId =
    localStorage.getItem(
        "adminSelectedStudentId"
    );

const deleteStudentButton =
    document.getElementById(
        "deleteStudentButton"
    );

const generateActivationButton =
    document.getElementById(
        "generateActivationButton"
    );

const activationResult =
    document.getElementById(
        "activationResult"
    );

const activationStudentId =
    document.getElementById(
        "activationStudentId"
    );

const activationCode =
    document.getElementById(
        "activationCode"
    );

const activationExpiry =
    document.getElementById(
        "activationExpiry"
    );

const activationMessage =
    document.getElementById(
        "activationMessage"
    );

const accountStatus =
    document.getElementById(
        "accountStatus"
    );

const deactivateAccountButton =
    document.getElementById(
        "deactivateAccountButton"
    );

const reactivateAccountButton =
    document.getElementById(
        "reactivateAccountButton"
    );

const accountStatusMessage =
    document.getElementById(
        "accountStatusMessage"
    );

if (!adminToken) {
    window.location.href =
        "admin-login.html";
}


if (!selectedStudentId) {
    window.location.href =
        "admin-students.html";
}


loadStudentProfile();

// ========================================
// LOAD ACCOUNT STATUS
// ========================================

async function loadAccountStatus() {
    try {

        const response = await fetch(
            `${window.API_BASE_URL}/api/admin/students/${selectedStudentId}/account-status`,
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
            accountStatus.textContent =
                "Unavailable";
            return;
        }

        accountStatus.textContent =
            data.accountStatus;

        if (
            data.accountStatus ===
            "deactivated"
        ) {
            deactivateAccountButton.style.display =
                "none";

            reactivateAccountButton.style.display =
                "inline-block";
        } else {
            deactivateAccountButton.style.display =
                "inline-block";

            reactivateAccountButton.style.display =
                "none";
        }

    } catch (error) {

        console.error(
            "Account status error:",
            error
        );

        accountStatus.textContent =
            "Unavailable";
    }
}

// ========================================
// DEACTIVATE ACCOUNT
// ========================================

deactivateAccountButton.addEventListener(
    "click",
    async function () {

        const confirmed =
            confirm(
                "Are you sure you want to deactivate this student's account?"
            );

        if (!confirmed) {
            return;
        }

        try {

            const response = await fetch(
                `${window.API_BASE_URL}/api/admin/students/${selectedStudentId}/deactivate`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${adminToken}`
                    }
                }
            );

            const data =
                await response.json();

            accountStatusMessage.textContent =
                data.message;

            if (response.ok) {
                loadAccountStatus();
            }

        } catch (error) {

            console.error(
                "Deactivate account error:",
                error
            );

            accountStatusMessage.textContent =
                "Unable to connect to the server.";
        }
    }
);


// ========================================
// REACTIVATE ACCOUNT
// ========================================

reactivateAccountButton.addEventListener(
    "click",
    async function () {

        const confirmed =
            confirm(
                "Reactivate this student's account?"
            );

        if (!confirmed) {
            return;
        }

        try {

            const response = await fetch(
                `${window.API_BASE_URL}/api/admin/students/${selectedStudentId}/reactivate`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${adminToken}`
                    }
                }
            );

            const data =
                await response.json();

            accountStatusMessage.textContent =
                data.message;

            if (response.ok) {
                loadAccountStatus();
            }

        } catch (error) {

            console.error(
                "Reactivate account error:",
                error
            );

            accountStatusMessage.textContent =
                "Unable to connect to the server.";
        }
    }
);


// ========================================
// GENERATE ACTIVATION CODE
// ========================================

generateActivationButton.addEventListener(
    "click",
    async function () {

        const confirmed =
            confirm(
                "Generate a new activation code for this student?"
            );

        if (!confirmed) {
            return;
        }


        generateActivationButton.disabled =
            true;

        generateActivationButton.textContent =
            "Generating...";


        try {

            const response = await fetch(
                `${window.API_BASE_URL}/api/admin/students/${selectedStudentId}/activation-code`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${adminToken}`
                    }
                }
            );



            const data =
                await response.json();


            if (!response.ok) {

                activationMessage.textContent =
                    data.message ||
                    "Unable to generate activation code.";

                generateActivationButton.disabled =
                    false;

                generateActivationButton.textContent =
                    "🔑 Generate Activation Code";

                return;
            }


            activationStudentId.textContent =
                data.studentId;

            activationCode.textContent =
                data.activation.code;

            activationExpiry.textContent =
                new Date(
                    data.activation.expiresAt
                ).toLocaleString();


            activationResult.style.display =
                "block";


            activationMessage.textContent =
                "New activation code generated successfully.";


            generateActivationButton.disabled =
                false;

            generateActivationButton.textContent =
                "🔑 Generate New Activation Code";


        } catch (error) {

            console.error(
                "Generate activation code error:",
                error
            );

            activationMessage.textContent =
                "Unable to connect to the server.";

            generateActivationButton.disabled =
                false;

            generateActivationButton.textContent =
                "🔑 Generate Activation Code";
        }
    }
);

const resetStudentPasswordButton =
    document.getElementById(
        "resetStudentPasswordButton"
    );

const newStudentPassword =
    document.getElementById(
        "newStudentPassword"
    );

const passwordResetMessage =
    document.getElementById(
        "passwordResetMessage"
    );

async function loadStudentProfile() {

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


        const student =
            data.students.find(
                student =>
                    student.studentId ===
                    selectedStudentId
            );


        if (!student) {

            document.getElementById(
                "studentName"
            ).textContent =
                "Student not found";

            return;
        }


        document.getElementById(
            "studentName"
        ).textContent =
            `${student.firstName} ${student.surname}`;


        document.getElementById(
            "studentId"
        ).textContent =
            student.studentId;


        document.getElementById(
            "studentClass"
        ).textContent =
            student.studentClass || "-";


        document.getElementById(
            "email"
        ).textContent =
            student.email || "-";


        document.getElementById(
            "gender"
        ).textContent =
            student.gender || "-";


        document.getElementById(
            "dob"
        ).textContent =
            student.dob || "-";


        document.getElementById(
            "phoneNo"
        ).textContent =
            student.phoneNo || "-";


        document.getElementById(
            "homeAddress"
        ).textContent =
            student.homeAddress || "-";


        document.getElementById(
            "subjects"
        ).textContent =
            student.subjects &&
            student.subjects.length > 0
                ? student.subjects.join(", ")
                : "No subjects assigned";

    } catch (error) {

        console.error(
            "Load student profile error:",
            error
        );

    }
}


loadStudentProfile();
loadAccountStatus();

// ========================================
// DELETE STUDENT
// ========================================

deleteStudentButton.addEventListener(
    "click",
    async function () {

        const confirmed =
            confirm(
                "Are you sure you want to delete this student? This will also delete the linked login, attendance records and results."
            );


        if (!confirmed) {
            return;
        }


        try {

            deleteStudentButton.disabled = true;

            deleteStudentButton.textContent =
                "Deleting...";


            const response = await fetch(
                `${window.API_BASE_URL}/api/admin/students/${selectedStudentId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${adminToken}`
                    }
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Unable to delete student."
                );

                deleteStudentButton.disabled =
                    false;

                deleteStudentButton.textContent =
                    "🗑️ Delete Student";

                return;
            }


            localStorage.removeItem(
                "adminSelectedStudentId"
            );


            alert(
                "Student deleted successfully."
            );


            window.location.href =
                "admin-students.html";


        } catch (error) {

            console.error(
                "Delete student error:",
                error
            );

            alert(
                "Unable to connect to the server."
            );

            deleteStudentButton.disabled =
                false;

            deleteStudentButton.textContent =
                "🗑️ Delete Student";
        }
    }
);

// ========================================
// RESET STUDENT PASSWORD
// ========================================

resetStudentPasswordButton.addEventListener(
    "click",
    async function () {

        const newPassword =
            newStudentPassword.value;

        if (!newPassword) {
            passwordResetMessage.textContent =
                "Enter a new password.";
            return;
        }

        if (newPassword.length < 8) {
            passwordResetMessage.textContent =
                "Password must be at least 8 characters.";
            return;
        }

        const confirmed =
            confirm(
                "Are you sure you want to reset this student's password?"
            );

        if (!confirmed) {
            return;
        }

        resetStudentPasswordButton.disabled =
            true;

        resetStudentPasswordButton.textContent =
            "Resetting...";

        try {

            const response = await fetch(
                `${window.API_BASE_URL}/api/admin/students/${selectedStudentId}/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${adminToken}`
                    },

                    body: JSON.stringify({
                        newPassword
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                passwordResetMessage.textContent =
                    data.message ||
                    "Unable to reset password.";

                return;
            }

            passwordResetMessage.textContent =
                "Student password reset successfully.";

            newStudentPassword.value = "";

        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );

            passwordResetMessage.textContent =
                "Unable to connect to the server.";

        } finally {

            resetStudentPasswordButton.disabled =
                false;

            resetStudentPasswordButton.textContent =
                "🔑 Reset Student Password";
        }
    }
);