// ===== CONFIG =====
const API_BASE = "http://localhost:8000";

// ===== SAMPLE FLIGHTS =====
const SAMPLE_FLIGHTS = [
    { id: 1,  flight_number: "DA-101", departure_city: "Sydney (SYD)",    arrival_city: "Tokyo (NRT)",       departure_time: "08:00 AM", arrival_time: "05:30 PM", departure_date: "2026-06-15", duration: "9h 30m",  price: 720  },
    { id: 2,  flight_number: "DA-202", departure_city: "Sydney (SYD)",    arrival_city: "London (LHR)",      departure_time: "09:15 AM", arrival_time: "06:00 AM", departure_date: "2026-06-15", duration: "22h 45m", price: 1150 },
    { id: 3,  flight_number: "DA-303", departure_city: "Sydney (SYD)",    arrival_city: "New York (JFK)",    departure_time: "11:30 AM", arrival_time: "09:45 AM", departure_date: "2026-06-15", duration: "19h 15m", price: 980  },
    { id: 4,  flight_number: "DA-404", departure_city: "Sydney (SYD)",    arrival_city: "Bali (DPS)",        departure_time: "07:00 AM", arrival_time: "11:30 AM", departure_date: "2026-06-15", duration: "6h 30m",  price: 310  },
    { id: 5,  flight_number: "DA-505", departure_city: "Sydney (SYD)",    arrival_city: "Singapore (SIN)",   departure_time: "02:00 PM", arrival_time: "07:15 PM", departure_date: "2026-06-15", duration: "8h 15m",  price: 450  },
    { id: 6,  flight_number: "DA-606", departure_city: "Melbourne (MEL)", arrival_city: "Tokyo (NRT)",       departure_time: "10:45 AM", arrival_time: "08:00 PM", departure_date: "2026-06-16", duration: "9h 15m",  price: 690  },
    { id: 7,  flight_number: "DA-707", departure_city: "London (LHR)",    arrival_city: "New York (JFK)",    departure_time: "08:15 AM", arrival_time: "11:00 AM", departure_date: "2026-06-16", duration: "7h 45m",  price: 450  },
    { id: 8,  flight_number: "DA-808", departure_city: "London (LHR)",    arrival_city: "Tokyo (NRT)",       departure_time: "11:45 AM", arrival_time: "09:30 AM", departure_date: "2026-06-16", duration: "12h 45m", price: 850  },
    { id: 9,  flight_number: "DA-909", departure_city: "New York (JFK)",  arrival_city: "Paris (CDG)",       departure_time: "06:30 PM", arrival_time: "07:45 AM", departure_date: "2026-06-17", duration: "7h 15m",  price: 520  },
    { id: 10, flight_number: "DA-110", departure_city: "Dubai (DXB)",     arrival_city: "London (LHR)",      departure_time: "03:00 AM", arrival_time: "07:30 AM", departure_date: "2026-06-17", duration: "7h 30m",  price: 390  },
    { id: 11, flight_number: "DA-111", departure_city: "Sydney (SYD)",    arrival_city: "Dubai (DXB)",       departure_time: "04:30 PM", arrival_time: "11:00 PM", departure_date: "2026-06-18", duration: "14h 30m", price: 870  },
    { id: 12, flight_number: "DA-112", departure_city: "Tokyo (NRT)",     arrival_city: "Paris (CDG)",       departure_time: "01:00 PM", arrival_time: "06:30 PM", departure_date: "2026-06-18", duration: "14h 30m", price: 940  },
];

// ===== AUTH - stored in localStorage =====

function saveToken(token)  { localStorage.setItem("fda_token", token); }
function getToken()        { return localStorage.getItem("fda_token"); }
function saveUser(user)    { localStorage.setItem("fda_user", JSON.stringify(user)); }
function getUser()         { const u = localStorage.getItem("fda_user"); return u ? JSON.parse(u) : null; }
function isLoggedIn()      { return !!getToken() && !!getUser(); }

function logout() {
    localStorage.removeItem("fda_token");
    localStorage.removeItem("fda_user");
    window.location.href = "login.html";
}

// ===== USER STORE =====

function getUsers() {
    const u = localStorage.getItem("fda_users");
    return u ? JSON.parse(u) : [];
}
function saveUsers(users) { localStorage.setItem("fda_users", JSON.stringify(users)); }

function registerUser(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("An account with this email already exists.");
    }
    const user = {
        id: Date.now(),
        name, email, password,
        loyalty_tier: "Silver Member",
        loyalty_points: 0,
        created_at: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
    return user;
}

function loginUser(email, password) {
    const user = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error("No account found with that email.");
    if (user.password !== password) throw new Error("Incorrect password.");
    return user;
}

function updateUserProfile(userId, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("User not found.");
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    saveUser(users[idx]);
    return users[idx];
}

// ===== BOOKINGS =====

function getBookings()          { const b = localStorage.getItem("fda_bookings"); return b ? JSON.parse(b) : []; }
function saveBookings(bookings) { localStorage.setItem("fda_bookings", JSON.stringify(bookings)); }

function getMyBookings() {
    const user = getUser();
    if (!user) return [];
    return getBookings().filter(b => b.user_id === user.id);
}

function createBooking(flight, seatNumber, cardInfo) {
    const user = getUser();
    if (!user) throw new Error("You must be logged in to book.");
    const letters = () => String.fromCharCode(65 + Math.floor(Math.random()*26));
    const code = "FLY-" + Math.floor(1000 + Math.random()*9000) + "-" + letters() + letters();
    const booking = {
        id: Date.now(),
        user_id: user.id,
        flight_id: flight.id,
        flight_number: flight.flight_number,
        departure_city: flight.departure_city,
        arrival_city: flight.arrival_city,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        departure_date: flight.departure_date,
        duration: flight.duration,
        seat_number: seatNumber || null,
        status: "confirmed",
        confirmation_code: code,
        total_price: flight.price,
        card_last4: cardInfo ? cardInfo.number.replace(/\s/g,"").slice(-4) : null,
        booked_at: new Date().toISOString()
    };
    const bookings = getBookings();
    bookings.push(booking);
    saveBookings(bookings);
    return booking;
}

function cancelBooking(bookingId) {
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) { bookings[idx].status = "cancelled"; saveBookings(bookings); }
}

function getTakenSeats(flightId) {
    return getBookings()
        .filter(b => b.flight_id === flightId && b.seat_number && b.status !== "cancelled")
        .map(b => b.seat_number);
}

// ===== FLIGHT SEARCH =====

function searchFlightsLocal(from, to, date) {
    let results = [...SAMPLE_FLIGHTS];
    if (from && from.trim()) results = results.filter(f => f.departure_city.toLowerCase().includes(from.trim().toLowerCase()));
    if (to   && to.trim())   results = results.filter(f => f.arrival_city.toLowerCase().includes(to.trim().toLowerCase()));
    if (date)                results = results.filter(f => f.departure_date === date);
    return results;
}

function getFlightById(id) {
    return SAMPLE_FLIGHTS.find(f => f.id === parseInt(id)) || null;
}

// ===== UI HELPERS =====

function showMessage(containerId, message, type = "error") {
    const el = document.getElementById(containerId);
    if (el) { el.className = "alert alert-" + type; el.textContent = message; el.style.display = "block"; }
}
function hideMessage(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.style.display = "none";
}
function formatDate(dateStr) {
    if (!dateStr) return "–";
    // Parse as local date to avoid timezone shift
    const [y, m, d] = dateStr.split("-");
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-AU", { month: "short", day: "numeric", year: "numeric" });
}

// Nav update
function updateNav() {
    const user = getUser();
    const icon = document.getElementById("nav-user-icon");
    if (!icon) return;
    if (user) { icon.title = "Logged in as " + user.name; icon.style.color = "#f59e0b"; }
    else       { icon.title = "Sign in"; icon.style.color = "#6b7280"; }
}
document.addEventListener("DOMContentLoaded", updateNav);
