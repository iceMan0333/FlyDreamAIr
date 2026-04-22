// FlyDreamAir simple frontend-only prototype
// This file uses browser localStorage instead of a backend or database.

// -------------------------
// 1. Demo data
// -------------------------
const demoFlights = [
  { id: 1, flightNumber: "FDA101", from: "Sydney", to: "Melbourne", date: "2026-05-24", time: "09:30", price: 180 },
  { id: 2, flightNumber: "FDA205", from: "Sydney", to: "Brisbane", date: "2026-05-25", time: "13:15", price: 220 },
  { id: 3, flightNumber: "FDA330", from: "Melbourne", to: "Perth", date: "2026-05-26", time: "08:45", price: 450 },
  { id: 4, flightNumber: "FDA880", from: "Sydney", to: "Tokyo", date: "2026-05-27", time: "21:10", price: 890 },
  { id: 5, flightNumber: "FDA777", from: "Sydney", to: "London", date: "2026-05-28", time: "19:40", price: 1450 }
];

const addonItems = [
  { id: "meal1", name: "Signature Meal", price: 28, category: "Food" },
  { id: "meal2", name: "Vegetarian Meal", price: 22, category: "Food" },
  { id: "wifi", name: "In-flight Wi-Fi", price: 15, category: "Service" },
  { id: "pillow", name: "Comfort Pillow", price: 12, category: "Comfort" }
];

// -------------------------
// 2. localStorage helpers
// -------------------------
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadData(key) {
  const data = localStorage.getItem(key);
  if (!data) return [];
  return JSON.parse(data);
}

function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function showMessage(id, message, type) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.className = type === "success" ? "alert alert-success" : "alert alert-error";
  element.style.display = "block";
}

function formatMoney(amount) {
  return "$" + Number(amount).toFixed(2);
}

// -------------------------
// 3. Start demo data
// -------------------------
function setupDemoData() {
  if (!localStorage.getItem("users")) {
    saveData("users", [
      { name: "Demo User", email: "demo@flydreamair.com", password: "password123" }
    ]);
  }

  if (!localStorage.getItem("flights")) {
    saveData("flights", demoFlights);
  }
}

setupDemoData();

// -------------------------
// 4. Authentication
// -------------------------
function registerUser() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (!name || !email || !password) {
    showMessage("message", "Please fill in all fields.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("message", "Passwords do not match.", "error");
    return;
  }

  const users = loadData("users");
  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    showMessage("message", "This email is already registered.", "error");
    return;
  }

  // Save new user to localStorage
  users.push({ name, email, password });
  saveData("users", users);

  showMessage("message", "Account created successfully. You can now login.", "success");
}

function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const users = loadData("users");
  const user = users.find(user => user.email === email && user.password === password);

  if (!user) {
    showMessage("message", "Invalid email or password.", "error");
    return;
  }

  // Save logged-in user
  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "index.html";
}

function logoutUser() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

function goToAccount() {
  if (getCurrentUser()) window.location.href = "manage.html";
  else window.location.href = "login.html";
}

// -------------------------
// 5. Flight search and booking
// -------------------------
function searchFlightsFromHome() {
  const from = document.getElementById("from-input").value.trim() || "Sydney";
  const to = document.getElementById("to-input").value.trim() || "Melbourne";

  localStorage.setItem("searchFrom", from);
  localStorage.setItem("searchTo", to);

  window.location.href = "flights.html";
}

function showFlightsPage() {
  const container = document.getElementById("flights-container");
  if (!container) return;

  const from = localStorage.getItem("searchFrom") || "Sydney";
  const to = localStorage.getItem("searchTo") || "Melbourne";
  const flights = loadData("flights");

  setText("route-title", from + " to " + to);

  let results = flights.filter(flight =>
    flight.from.toLowerCase().includes(from.toLowerCase()) &&
    flight.to.toLowerCase().includes(to.toLowerCase())
  );

  // If no exact result is found, show all sample flights so the demo still works.
  if (results.length === 0) results = flights;

  container.innerHTML = "";

  results.forEach(flight => {
    container.innerHTML += `
      <div class="flight-card">
        <div>
          <h3>${flight.flightNumber}</h3>
          <p>${flight.from} → ${flight.to}</p>
          <p>${flight.date} at ${flight.time}</p>
        </div>
        <div>
          <h3>${formatMoney(flight.price)}</h3>
          <button class="btn btn-primary" onclick="selectFlight(${flight.id})">Select Flight</button>
        </div>
      </div>
    `;
  });
}

function selectFlight(flightId) {
  const flights = loadData("flights");
  const flight = flights.find(item => item.id === flightId);

  if (!flight) return;

  // Save selected flight until the booking is confirmed
  saveData("selectedFlight", flight);
  window.location.href = "seats.html";
}

// -------------------------
// 6. Seat selection
// -------------------------
function showSeatPage() {
  const seatMap = document.getElementById("seat-map");
  if (!seatMap) return;

  const selectedFlight = JSON.parse(localStorage.getItem("selectedFlight"));

  if (!selectedFlight) {
    seatMap.innerHTML = "<p>Please select a flight first.</p>";
    return;
  }

  setText("flight-subtitle", selectedFlight.flightNumber + " - " + selectedFlight.from + " to " + selectedFlight.to);

  const rows = ["A", "B", "C", "D"];
  seatMap.innerHTML = "";

  // Create simple seat buttons
  for (let row = 1; row <= 6; row++) {
    rows.forEach(letter => {
      const seat = row + letter;
      seatMap.innerHTML += `<button class="seat" onclick="selectSeat('${seat}')">${seat}</button>`;
    });
    seatMap.innerHTML += "<br>";
  }
}

function selectSeat(seat) {
  localStorage.setItem("selectedSeat", seat);
  setText("selected-seat-label", seat);
}

function continueToAddons() {
  const selectedSeat = localStorage.getItem("selectedSeat");

  if (!selectedSeat) {
    alert("Please select a seat first.");
    return;
  }

  window.location.href = "shop.html";
}

// -------------------------
// 7. Add-ons
// -------------------------
function showAddonsPage() {
  const container = document.getElementById("addons-container");
  if (!container) return;

  container.innerHTML = "";

  addonItems.forEach(item => {
    container.innerHTML += `
      <div class="product-card">
        <h3>${item.name}</h3>
        <p>${item.category}</p>
        <p>${formatMoney(item.price)}</p>
        <button class="btn btn-primary" onclick="addAddon('${item.id}')">Add</button>
      </div>
    `;
  });

  updateCartView();
}

function addAddon(addonId) {
  const item = addonItems.find(addon => addon.id === addonId);
  const cart = loadData("currentCart");

  cart.push(item);
  saveData("currentCart", cart);

  updateCartView();
}

function updateCartView() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const cart = loadData("currentCart");
  let total = 0;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>No add-ons selected.</p>";
  }

  cart.forEach(item => {
    total += item.price;
    container.innerHTML += `<p>${item.name} - ${formatMoney(item.price)}</p>`;
  });

  setText("cart-total", formatMoney(total));
}

function finishBooking() {
  const user = getCurrentUser();

  if (!user) {
    alert("Please login before completing booking.");
    window.location.href = "login.html";
    return;
  }

  const selectedFlight = JSON.parse(localStorage.getItem("selectedFlight"));
  const selectedSeat = localStorage.getItem("selectedSeat");
  const cart = loadData("currentCart");

  if (!selectedFlight || !selectedSeat) {
    alert("Missing flight or seat information.");
    return;
  }

  const bookings = loadData("bookings");

  // This is our simple booking record saved in browser storage.
  const booking = {
    id: Date.now(),
    userEmail: user.email,
    flight: selectedFlight,
    seat: selectedSeat,
    addons: cart,
    status: "Confirmed",
    createdAt: new Date().toLocaleString()
  };

  bookings.push(booking);
  saveData("bookings", bookings);

  localStorage.setItem("lastBookingId", booking.id);
  localStorage.removeItem("currentCart");

  window.location.href = "confirmation.html";
}

// -------------------------
// 8. Confirmation and manage trips
// -------------------------
function showConfirmationPage() {
  const container = document.getElementById("confirmation-content");
  if (!container) return;

  const bookings = loadData("bookings");
  const lastBookingId = Number(localStorage.getItem("lastBookingId"));
  const booking = bookings.find(item => item.id === lastBookingId) || bookings[bookings.length - 1];

  if (!booking) {
    container.innerHTML = "<p>No booking found.</p>";
    return;
  }

  const addonTotal = booking.addons.reduce((sum, item) => sum + item.price, 0);
  const total = booking.flight.price + addonTotal;

  container.innerHTML = `
    <div class="card">
      <h2>Booking Confirmed</h2>
      <p><strong>Flight:</strong> ${booking.flight.flightNumber}</p>
      <p><strong>Route:</strong> ${booking.flight.from} → ${booking.flight.to}</p>
      <p><strong>Date:</strong> ${booking.flight.date} at ${booking.flight.time}</p>
      <p><strong>Seat:</strong> ${booking.seat}</p>
      <p><strong>Status:</strong> ${booking.status}</p>
      <p><strong>Total:</strong> ${formatMoney(total)}</p>
      <a class="btn btn-primary" href="manage.html">Manage Trips</a>
    </div>
  `;
}

function showManageTripsPage() {
  const container = document.getElementById("trips-container");
  if (!container) return;

  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  setText("user-name", user.name);

  const bookings = loadData("bookings").filter(booking => booking.userEmail === user.email);

  container.innerHTML = "";

  if (bookings.length === 0) {
    container.innerHTML = "<p>No bookings yet.</p>";
    return;
  }

  bookings.forEach(booking => {
    container.innerHTML += `
      <div class="trip-card">
        <h3>${booking.flight.flightNumber}: ${booking.flight.from} → ${booking.flight.to}</h3>
        <p>Date: ${booking.flight.date} at ${booking.flight.time}</p>
        <p>Seat: ${booking.seat}</p>
        <p>Status: ${booking.status}</p>
        <button class="btn btn-outline" onclick="cancelBooking(${booking.id})">Cancel Booking</button>
      </div>
    `;
  });
}

function cancelBooking(bookingId) {
  const bookings = loadData("bookings");

  const updatedBookings = bookings.map(booking => {
    if (booking.id === bookingId) {
      booking.status = "Cancelled";
    }
    return booking;
  });

  saveData("bookings", updatedBookings);
  showManageTripsPage();
}

// -------------------------
// 9. Run correct page function
// -------------------------
document.addEventListener("DOMContentLoaded", function () {
  showFlightsPage();
  showSeatPage();
  showAddonsPage();
  showConfirmationPage();
  showManageTripsPage();
});
