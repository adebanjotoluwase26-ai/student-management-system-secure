const adminLoginForm =
    document.getElementById("adminLoginForm");

const message =
    document.getElementById("message");

adminLoginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        message.textContent = "Logging in...";

        try {

            const response = await fetch(
                `${window.API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                message.textContent =
                    data.message || "Login failed";

                return;
            }

            // Make sure only an admin can continue
            if (data.user.role !== "admin") {
                message.textContent =
                    "This login is for administrators only.";

                return;
            }

            // Store admin JWT
            localStorage.setItem(
                "adminToken",
                data.token
            );

            // Store admin information
            localStorage.setItem(
                "adminUser",
                JSON.stringify(data.user)
            );

            message.textContent =
                "Login successful!";

            window.location.href =
                "admin-dashboard.html";

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";
        }
    }
);