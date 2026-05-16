let monthlyChart;
let categoryChart;

document.addEventListener("DOMContentLoaded", () => {
	const dateInput = document.getElementById("transactionDate");
	if (dateInput) {
		dateInput.valueAsDate = new Date();
	}

	const form = document.getElementById("transactionForm");
	if (form) {
		form.addEventListener("submit", async (event) => {
			event.preventDefault();
			await addTransaction();
		});
	}

	loadDashboard();
});

function getToken() {
	return localStorage.getItem("token")
		|| localStorage.getItem("jwt")
		|| localStorage.getItem("authToken")
		|| localStorage.getItem("accessToken");
}

function authHeaders() {
	const token = getToken();

	return {
		"Content-Type": "application/json",
		"Authorization": "Bearer " + token
	};
}

function redirectToLogin() {
	localStorage.removeItem("token");
	localStorage.removeItem("jwt");
	localStorage.removeItem("authToken");
	localStorage.removeItem("accessToken");
	window.location.href = "/login";
}

async function loadDashboard() {
	const token = getToken();

	console.log("Token from localStorage:", token);

	if (!token) {
		alert("No token found in localStorage");
		window.location.href = "/login";
		return;
	}

	const response = await fetch("/api/dashboard", {
		method: "GET",
		headers: authHeaders()
	});

	console.log("Dashboard API status:", response.status);

	if (response.status === 401 || response.status === 403) {
		alert("Token rejected by backend");
		window.location.href = "/login";
		return;
	}

	if (!response.ok) {
		const errorText = await response.text();
		console.error("Dashboard API error:", response.status, errorText);
		alert("Dashboard API error: " + response.status);
		return;
	}


	const data = await response.json();

	dashboardData = data;

	setProfile(data.username);
	renderCategories(data.categoryTotals || {});
	renderReports(data);

	setText("totalBalance", money(data.totalBalance));
	setText("totalIncome", money(data.totalIncome));
	setText("totalExpense", money(data.totalExpense));
	setText("totalSavings", money(data.totalSavings));

	renderTransactions(data.recentTransactions || []);
	renderMonthlyChart(data.monthly || []);
	renderCategoryChart(data.categoryTotals || {});

	setText("topCategoryName", data.topCategory.name);
	setText("topCategoryAmount", money(data.topCategory.amount));
}

async function addTransaction() {
	const token = getToken();

	if (!token) {
		redirectToLogin();
		return;
	}

	const payload = {
		description: value("description"),
		category: selectedCategory(),
		type: value("type"),
		amount: Number(value("amount")),
		transactionDate: value("transactionDate")
	};

	const response = await fetch("/api/dashboard/transactions", {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify(payload)
	});

	if (response.status === 401 || response.status === 403) {
		redirectToLogin();
		return;
	}

	if (!response.ok) {
		console.error("Add transaction failed:", response.status);
		return;
	}

	closeModal();

	const form = document.getElementById("transactionForm");
	if (form) {
		form.reset();
	}

	toggleCustomCategory();

	const dateInput = document.getElementById("transactionDate");
	if (dateInput) {
		dateInput.valueAsDate = new Date();
	}

	await loadDashboard();
}

async function deleteTransaction(id) {
	const confirmDelete = confirm("Are you sure you want to delete this transaction?");

	if (!confirmDelete) {
		return;
	}

	const response = await fetch(`/api/dashboard/transactions/${id}`, {
		method: "DELETE",
		headers: authHeaders()
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error("Delete transaction failed:", response.status, errorText);
		alert("Delete failed. Check console.");
		return;
	}

	await loadDashboard();

	const transactionsSection = document.getElementById("transactionsSection");
	if (transactionsSection && !transactionsSection.classList.contains("hidden")) {
		await loadAllTransactions();
	}
}


function renderTransactions(transactions) {
	const table = document.getElementById("transactionsTable");
	if (!table) return;

	table.innerHTML = "";

	if (transactions.length === 0) {
		table.innerHTML = `
            <tr>
                <td colspan="6" class="p-4 text-center text-slate-500">
                    No transactions yet
                </td>
            </tr>
        `;
		return;
	}

	transactions.forEach(transaction => {
		const badgeClass = transaction.type === "INCOME"
			? "bg-emerald-100 text-emerald-700"
			: "bg-rose-100 text-rose-700";

		table.innerHTML += `
            <tr class="border-b">
                <td class="p-3">${transaction.transactionDate}</td>
                <td class="p-3">${transaction.description}</td>
                <td class="p-3">${transaction.category}</td>
                <td class="p-3">
                    <span class="px-3 py-1 rounded-full text-xs ${badgeClass}">
                        ${transaction.type}
                    </span>
                </td>
                <td class="p-3 text-right">${money(transaction.amount)}</td>
                <td class="p-3 text-right">
                    <button onclick="deleteTransaction(${transaction.id})"
                            class="text-rose-600 hover:underline">
                        Delete
                    </button>
                </td>
            </tr>
        `;
	});
}

function renderMonthlyChart(monthly) {
	const chartElement = document.getElementById("monthlyChart");
	if (!chartElement) return;

	const labels = monthly.map(item => item.month);
	const income = monthly.map(item => item.income);
	const expense = monthly.map(item => item.expense);

	if (monthlyChart) monthlyChart.destroy();

	monthlyChart = new Chart(chartElement, {
		type: "line",
		data: {
			labels,
			datasets: [
				{
					label: "Income",
					data: income,
					borderColor: "#10b981",
					backgroundColor: "rgba(16,185,129,0.12)",
					fill: true,
					tension: 0.35
				},
				{
					label: "Expense",
					data: expense,
					borderColor: "#f43f5e",
					backgroundColor: "rgba(244,63,94,0.12)",
					fill: true,
					tension: 0.35
				}
			]
		}
	});
}

function renderCategoryChart(categoryTotals) {
	const chartElement = document.getElementById("categoryChart");
	if (!chartElement) return;

	const labels = Object.keys(categoryTotals);
	const values = Object.values(categoryTotals);

	if (categoryChart) categoryChart.destroy();

	categoryChart = new Chart(chartElement, {
		type: "doughnut",
		data: {
			labels,
			datasets: [{
				data: values,
				backgroundColor: [
					"#10b981",
					"#3b82f6",
					"#8b5cf6",
					"#f59e0b",
					"#f43f5e",
					"#64748b"
				]
			}]
		}
	});
}

function openModal() {
	const modal = document.getElementById("transactionModal");
	if (!modal) return;

	modal.classList.remove("hidden");
	modal.classList.add("flex");
}

function closeModal() {
	const modal = document.getElementById("transactionModal");
	if (!modal) return;

	modal.classList.add("hidden");
	modal.classList.remove("flex");
}

function money(value) {
	return "₹ " + Number(value || 0).toLocaleString("en-IN", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}

function setText(id, text) {
	const element = document.getElementById(id);
	if (element) {
		element.innerText = text;
	}
}

function value(id) {
	const element = document.getElementById(id);
	return element ? element.value : "";
}



function setProfile(username) {
	const finalName = username || "User";

	setText("profileUsername", finalName);
	setText("settingsUsername", finalName);

	const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=2563eb&color=fff`;

	const profilePhoto = document.getElementById("profilePhoto");
	const settingsPhoto = document.getElementById("settingsProfilePhoto");

	if (profilePhoto) profilePhoto.src = photoUrl;
	if (settingsPhoto) settingsPhoto.src = photoUrl;
}

function showSection(sectionId, clickedButton) {
	document.querySelectorAll(".page-section").forEach(section => {
		section.classList.add("hidden");
	});

	const selectedSection = document.getElementById(sectionId);
	if (selectedSection) {
		selectedSection.classList.remove("hidden");
	}

	document.querySelectorAll(".nav-btn").forEach(button => {
		button.classList.remove("bg-blue-600", "text-white", "shadow-sm");
		button.classList.add("text-slate-600", "hover:bg-slate-100");
	});

	if (clickedButton) {
		clickedButton.classList.remove("text-slate-600", "hover:bg-slate-100");
		clickedButton.classList.add("bg-blue-600", "text-white", "shadow-sm");
	}

	const sidebar = document.getElementById("sidebar");
	const overlay = document.getElementById("sidebarOverlay");

	if (window.innerWidth < 1024 && sidebar && overlay) {
		sidebar.classList.add("-translate-x-full");
		overlay.classList.add("hidden");
	}

	if (sectionId === "transactionsSection") {
		loadAllTransactions();
	}
}



async function loadAllTransactions() {
	const response = await fetch("/api/dashboard/transactions", {
		headers: authHeaders()
	});

	if (!response.ok) {
		console.error("All transactions error:", await response.text());
		return;
	}

	const transactions = await response.json();
	renderTransactionsToTable("allTransactionsTable", transactions);
}

function renderTransactions(transactions) {
    renderTransactionsToTable("transactionsTable", transactions);
}

function renderTransactionsToTable(tableId, transactions) {
	const table = document.getElementById(tableId);
	if (!table) return;

	table.innerHTML = "";

	if (!transactions || transactions.length === 0) {
		table.innerHTML = `
            <tr>
                <td colspan="6" class="p-4 text-center text-slate-500">
                    No transactions yet
                </td>
            </tr>
        `;
		return;
	}

	transactions.forEach(transaction => {
		const badgeClass = transaction.type === "INCOME"
			? "bg-emerald-100 text-emerald-700"
			: "bg-rose-100 text-rose-700";

		table.innerHTML += `
            <tr class="border-b">
                <td class="p-3">${transaction.transactionDate}</td>
                <td class="p-3">${transaction.description}</td>
                <td class="p-3">${transaction.category}</td>
                <td class="p-3">
                    <span class="px-3 py-1 rounded-full text-xs ${badgeClass}">
                        ${transaction.type}
                    </span>
                </td>
                <td class="p-3 text-right">${money(transaction.amount)}</td>
                <td class="p-3 text-right">
                    <button onclick="deleteTransaction(${transaction.id})"
                            class="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg hover:bg-rose-200">
                        Delete
                    </button>
                </td>
            </tr>
        `;
	});
}


function renderCategories(categoryTotals) {
	const container = document.getElementById("categoriesList");
	if (!container) return;

	container.innerHTML = "";

	const entries = Object.entries(categoryTotals);

	if (entries.length === 0) {
		container.innerHTML = `<p class="text-slate-500">No expense categories yet.</p>`;
		return;
	}

	entries.forEach(([category, amount]) => {
		container.innerHTML += `
            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <p class="text-slate-500">Category</p>
                <h4 class="font-bold text-lg">${category}</h4>
                <p class="text-rose-600 font-bold mt-2">${money(amount)}</p>
            </div>
        `;
	});
}

function renderReports(data) {
	setText("reportIncome", money(data.totalIncome));
	setText("reportExpense", money(data.totalExpense));
	setText("reportBalance", money(data.totalBalance));
}

function logout() {
	localStorage.removeItem("token");
	localStorage.removeItem("jwt");
	localStorage.removeItem("authToken");
	localStorage.removeItem("accessToken");

	window.location.href = "/";
}

function toggleCustomCategory() {
	const category = document.getElementById("category");
	const customCategory = document.getElementById("customCategory");

	if (!category || !customCategory) return;

	if (category.value === "Other") {
		customCategory.classList.remove("hidden");
		customCategory.required = true;
	} else {
		customCategory.classList.add("hidden");
		customCategory.required = false;
		customCategory.value = "";
	}
}

function selectedCategory() {
	const category = value("category");

	if (category === "Other") {
		return value("customCategory");
	}

	return category;
}


function toggleSidebar() {
	const sidebar = document.getElementById("sidebar");
	const overlay = document.getElementById("sidebarOverlay");

	if (!sidebar || !overlay) return;

	sidebar.classList.toggle("-translate-x-full");
	overlay.classList.toggle("hidden");
}

