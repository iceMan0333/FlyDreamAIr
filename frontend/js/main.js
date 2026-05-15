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
    if (!u) return null;
    try {
        return JSON.parse(u);
    } catch (err) {
        localStorage.removeItem("user");
        return null;
    }
}

function isLoggedIn() {
    return Boolean(getToken());
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
    const token = getToken();
    const navIcon = document.getElementById("nav-user-icon");
    if (navIcon && token) {
        navIcon.title = user ? `Logged in as ${user.name}` : "Logged in";
        navIcon.style.color = "#2563eb";
    }
}

// Call updateNav on page load
document.addEventListener("DOMContentLoaded", updateNav);


// ===== DEMO POLISH HELPERS =====
const DESTINATION_IMAGES = {
    "Santorini": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&q=80",
    "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80",
    "Reykjavik": "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=900&q=80",
    "Iceland": "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=900&q=80",
    "Banff": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80",
    "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=80",
    "New York": "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=900&q=80",
    "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=900&q=80",
    "default": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80"
};
function getDestinationImage(city) {
    for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
        if (city && city.toLowerCase().includes(key.toLowerCase())) return url;
    }
    return DESTINATION_IMAGES.default;
}
function money(value) { return `$${Number(value || 0).toFixed(2)}`; }
function flightMeta(flight) {
    const aircraft = ["Boeing 787-9 Dreamliner", "Airbus A350-900", "Boeing 777-300ER"][(Number(flight.id || 0)) % 3];
    const gate = `A${10 + (Number(flight.id || 0) % 18)}`;
    const seatsLeft = 3 + (Number(flight.id || 0) % 9);
    return { aircraft, gate, seatsLeft };
}
function showToast(message, type = "success") {
    let toast = document.getElementById("global-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "global-toast";
        document.body.appendChild(toast);
    }
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 2600);
}
