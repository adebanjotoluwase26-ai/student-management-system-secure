const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    try {
        const response = await fetch(
            "${window.API_BASE_URL}/api/auth/login",
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
            message.textContent = data.message || "Login failed";
            return;
        }

        // Store the JWT
        localStorage.setItem("token", data.token);

        // Store basic user information
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        message.textContent = "Login successful!";

        console.log("Logged in user:", data.user);

        window.location.href = "student-dashboard.html";

    } catch (error) {
        console.error("Login error:", error);
        message.textContent =
            "Unable to connect to the server.";
    }
});