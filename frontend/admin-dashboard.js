const adminToken = localStorage.getItem("adminToken");

const adminName =
    document.getElementById("adminName");

const message =
    document.getElementById("message");

const logoutButton =
    document.getElementById("logoutButton");


if (!adminToken) {
    window.location.href = "admin-login.html";
}


async function verifyAdmin() {
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

            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");

            window.location.href = "admin-login.html";

            return;
        }

        const adminUser =
            JSON.parse(
                localStorage.getItem("adminUser")
            );

        if (adminUser) {
            adminName.textContent =
                adminUser.name;
        }

        message.textContent =
             "Welcome to the admin dashboard";

    } catch (error) {

        console.error(
            "Admin verification error:",
            error
        );

        message.textContent =
            "Unable to connect to the server.";
    }
}


logoutButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        window.location.href =
            "admin-login.html";
    }
);


verifyAdmin();