// Function to check if user is logged in and update UI
function checkLoginStatus() {
    const token = localStorage.getItem("token");
    const profileButton = document.getElementById("viewProfileButton");

    if (profileButton) {
        if (token) {
            profileButton.style.display = "block";
        } else {
            profileButton.style.display = "none";
        }
    }
}

// Signup
document.getElementById("secureSignupForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const emailInput = document.getElementById("secureSignupEmail");
    const passwordInput = document.getElementById("secureSignupPassword");

    fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value, password: passwordInput.value }),
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        emailInput.value = "";
        passwordInput.value = "";
    })
    .catch(error => console.error("Error:", error));
});

// Login
document.getElementById("secureLoginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const emailInput = document.getElementById("secureEmail");
    const passwordInput = document.getElementById("securePassword");

    fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value, password: passwordInput.value }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            alert("Login successful");
            emailInput.value = "";
            passwordInput.value = "";
            checkLoginStatus();
        } else {
            alert("Invalid credentials");
        }
    })
    .catch(error => console.error("Error:", error));
});

// Profile
function viewSecureProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in first");
        return;
    }

    fetch("http://localhost:4000/profile", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("secureProfileResult").innerHTML = `
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Password:</strong> ${data.password}</p>
        `;
    })
    .catch(error => console.error("Error:", error));
}

// Logout function
function logout() {
    localStorage.removeItem("token");
    alert("Logged out successfully");
    checkLoginStatus(); // Update UI after logout
}

// Run on page load
document.addEventListener("DOMContentLoaded", checkLoginStatus);
