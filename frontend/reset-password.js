const resetPasswordForm =
    document.getElementById(
        "resetPasswordForm"
    );

const message =
    document.getElementById(
        "message"
    );


resetPasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const studentId =
            document.getElementById(
                "studentId"
            ).value.trim().toUpperCase();

        const resetToken =
            document.getElementById(
                "resetToken"
            ).value.trim();

        const newPassword =
            document.getElementById(
                "newPassword"
            ).value;

        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;


        if (newPassword !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            return;
        }


        if (newPassword.length < 8) {

            message.textContent =
                "Password must be at least 8 characters.";

            return;
        }


        message.textContent =
            "Resetting password...";


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        studentId,
                        resetToken,
                        newPassword
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Password reset failed.";

                return;
            }


            message.textContent =
                "Password reset successfully!";


            resetPasswordForm.reset();


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1200);


        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";
        }
    }
);