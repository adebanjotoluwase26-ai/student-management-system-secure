const activationForm =
    document.getElementById("activationForm");

const message =
    document.getElementById("message");


activationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        message.textContent =
            "Activating account...";


        const studentId =
            document.getElementById("studentId")
                .value.trim()
                .toUpperCase();

        const activationCode =
            document.getElementById("activationCode")
                .value.trim()
                .toUpperCase();

        const dob =
            document.getElementById("dob")
                .value;

        const email =
            document.getElementById("email")
                .value.trim();

        const password =
            document.getElementById("password")
                .value;

        const confirmPassword =
            document.getElementById("confirmPassword")
                .value;


        // Check passwords
        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            return;
        }


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/activate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        studentId,
                        activationCode,
                        dob,
                        email,
                        password
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Account activation failed.";

                return;
            }


            message.textContent =
                "Account activated successfully!";


            activationForm.reset();


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1000);


        } catch (error) {

            console.error(
                "Activation error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";
        }
    }
);