// ===== CONFIG =====
const API_BASE = "http://localhost:8000";

// ===== AUTH HELPERS =====

// Save token to localStorage after login
function saveToken(token) {
    localStorage.setItem("token", token);
}

// Get saved token
function getToken() {
    return localStorage.getItem("token");
}

// Remove token on logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../pages/login.html";
}

// Save user info
function saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

// Get current user
function getUser() {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
}

// Check if logged in, redirect if not
function requireLogin() {
    if (!getToken()) {
        window.location.href = "../pages/login.html";
    }
}

// ===== API HELPER =====

// Make API requests with optional auth token
async function apiRequest(endpoint, method = "GET", body = null) {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    let data = null;
    try {
        data = await response.json();
    } catch (err) {
        data = null;
    }

    if (!response.ok) {
        throw new Error((data && data.detail) || `Request failed with status ${response.status}`);
    }
    return data;
}

// ===== UI HELPERS =====

// Show an error or success message in a container
function showMessage(containerId, message, type = "error") {
    const el = document.getElementById(containerId);
    if (el) {
        el.className = `alert alert-${type}`;
        el.textContent = message;
        el.style.display = "block";
    }
}

// Hide a message container
function hideMessage(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.style.display = "none";
}

// Show loading spinner inside an element
function showLoading(containerId) {
    const el = document.getElementById(containerId);
    if (el) {
        el.innerHTML = `<div class="loading"><div class="spinner"></div><p>Loading...</p></div>`;
    }
}

// Format a date nicely e.g. "Oct 24, 2024"
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Format time e.g. "08:15 AM"
function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// Update nav to show logged-in state
function updateNav() {
    const user = getUser();
    const navIcon = document.getElementById("nav-user-icon");
    if (navIcon && user) {
        navIcon.title = `Logged in as ${user.name}`;
        navIcon.style.color = "#2563eb";
    }
}

// Call updateNav on page load
document.addEventListener("DOMContentLoaded", updateNav);
