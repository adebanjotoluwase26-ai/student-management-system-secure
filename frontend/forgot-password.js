const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );

const message =
    document.getElementById(
        "message"
    );


forgotPasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const studentId =
            document.getElementById(
                "studentId"
            ).value.trim().toUpperCase();

        const email =
            document.getElementById(
                "email"
            ).value.trim().toLowerCase();


        if (!studentId && !email) {

            message.textContent =
                "Enter your Student ID or registered email.";

            return;
        }


        message.textContent =
            "Processing request...";


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/forgot-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        studentId: studentId || undefined,
                        email: email || undefined
                    })
                }
            );


            const data =
                await response.json();


            message.textContent =
                data.message ||
                "Password reset request processed.";


        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";
        }
    }
);