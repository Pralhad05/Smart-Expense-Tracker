const API = "/auth";

/* ---------------- NAVIGATION ---------------- */

function goLogin() {
	window.location.href = "/login";
}

function goRegister() {
	window.location.href = "/register";
}

/* ---------------- REGISTER ---------------- */


function register() {
	const username = document.getElementById("username").value.trim();
	const email = document.getElementById("email").value.trim();
	const password = document.getElementById("password").value.trim();

	fetch("/auth/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, email, password })
	})
		.then(response => {
			if (!response.ok) {
				return response.text().then(message => {
					throw new Error(message || "Registration failed");
				});
			}

			return response.text();
		})
		.then(() => {
			alert("Registration successful. Please login.");
			window.location.href = "/login";
		})
		.catch(error => {
			alert(error.message);
		});
}
/* ---------------- LOGIN ---------------- */

function login() {
	const username = document.getElementById("username").value.trim();
	const password = document.getElementById("password").value.trim();

	fetch("/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password })
	})
		.then(response => {
			if (!response.ok) {
				return response.text().then(message => {
					throw new Error(message || "Login failed");
				});
			}

			return response.text();
		})
		.then(token => {
			localStorage.setItem("token", token);
			window.location.href = "/dashboard";
		})
		.catch(error => {
			alert(error.message);
		});
}

/* ---------------- TOAST ---------------- */

function showToast(message, type) {

	let toast = document.getElementById("toast");

	// create if not exists
	if (!toast) {
		toast = document.createElement("div");
		toast.id = "toast";
		document.body.appendChild(toast);
	}

	toast.innerText = message;
	toast.className = "toast show " + type;

	setTimeout(() => {
		toast.className = "toast";
	}, 3000);
}

/* ---------------- PROTECT DASHBOARD ---------------- */

function checkAuth() {
	const token = localStorage.getItem("token");

	if (!token) {
		window.location.href = "/login";
	}
}


/*  ------------------  Forgot Pass --------------------*/

function resetPassword() {

	const username = document.getElementById("fpUsername").value;
	const newPassword = document.getElementById("newPassword").value;

	if (!username || !newPassword) {
		document.getElementById("message").innerText = "Fill all fields!";
		return;
	}

	fetch("/auth/reset", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: username,
			password: newPassword
		})
	})
		.then(res => {
			if (!res.ok) {
				return res.text().then(msg => { throw new Error(msg); });
			}
			return res.text();
		})
		.then(msg => {
			alert(msg);
			window.location.href = "/login";
		})
		.catch(err => {
			document.getElementById("message").innerText = err.message;
		});
} 

function forgotPassword() {
    const identifier = document.getElementById("identifier").value.trim();

    if (!identifier) {
        alert("Please enter username or email");
        return;
    }

    alert("Password reset feature will be added soon for: " + identifier);
}
