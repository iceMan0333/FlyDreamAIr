document.addEventListener('DOMContentLoaded', function() {
    // Load booking data.
    // Bookings are stored locally for this demo.
    const container = document.querySelector('.manage-booking-container');
    const currentUser = JSON.parse(localStorage.getItem('flydreamairCurrentUser') || 'null');
    const allBookings = JSON.parse(localStorage.getItem('flydreamairBookings') || '[]');

    // Only show bookings that belong to the logged-in user.
    const bookings = currentUser
        ? allBookings.filter(booking => booking.ownerEmail === currentUser.email)
        : [];

    // Show a sign-in prompt when there is no logged-in user.
    function renderLoggedOut() {
        container.innerHTML = `
            <h1 class="manage-booking-title">Manage Booking</h1>
            <p class="manage-booking-subtitle">Please sign in to view and manage your booked flights.</p>
            <div class="button-container">
                <button class="signup-button" id="signupDemoBtn">Create Account</button>
                <span class="or-text">or</span>
                <button class="continue-button" id="loginDemoBtn">Sign In</button>
            </div>
        `;

        document.getElementById('signupDemoBtn').addEventListener('click', () => {
            window.location.href = '../../signup/html/signup.html';
        });

        document.getElementById('loginDemoBtn').addEventListener('click', () => {
            window.location.href = '../../login/html/login.html';
        });
    }

    // Show an empty state when the user has no saved bookings.
    function renderNoBookings() {
        container.innerHTML = `
            <h1 class="manage-booking-title">Manage Booking</h1>
            <p class="manage-booking-subtitle">Hi ${currentUser.username}, you do not have any booked flights yet.</p>
            <div class="button-container">
                <button class="continue-button" id="bookFlightBtn">Book a Flight</button>
            </div>
        `;

        document.getElementById('bookFlightBtn').addEventListener('click', () => {
            window.location.href = '../../index.html#booking';
        });
    }

    // Show saved bookings with change seat and cancel options.
    function renderBookings() {
        const cards = bookings.map((booking, index) => `
            <div class="booking-card" data-reference="${booking.bookingReference}">
                <h2>${booking.fromCity} to ${booking.toCity}</h2>
                <p><strong>Status:</strong> ${booking.status}</p>
                <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
                <p><strong>Passenger:</strong> ${booking.passengerName}</p>
                <p><strong>Departure Date:</strong> ${booking.departDate}</p>
                ${booking.returnDate ? `<p><strong>Return Date:</strong> ${booking.returnDate}</p>` : ''}
                <p><strong>Flight:</strong> ${booking.departureTime || 'Selected flight'}</p>
                ${booking.returnTime ? `<p><strong>Return:</strong> ${booking.returnTime}</p>` : ''}
                <p><strong>Seat:</strong> ${booking.seatNumber}</p>
                <p><strong>Total Paid:</strong> $${booking.totalPaid}</p>
                <div class="booking-actions">
                    <button class="continue-button change-seat-btn" data-index="${index}">Change Seat</button>
                    <button class="signup-button cancel-booking-btn" data-index="${index}">Cancel Booking</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <h1 class="manage-booking-title">Manage Booking</h1>
            <p class="manage-booking-subtitle">Hi ${currentUser.username}, here are your booked flights.</p>
            <div class="bookings-list">${cards}</div>
            <div class="button-container">
                <button class="continue-button" id="bookAnotherBtn">Book Another Flight</button>
            </div>
        `;

        document.getElementById('bookAnotherBtn').addEventListener('click', () => {
            window.location.href = '../../index.html#booking';
        });

        document.querySelectorAll('.cancel-booking-btn').forEach(button => {
            button.addEventListener('click', function() {
                const localIndex = Number(this.dataset.index);
                const booking = bookings[localIndex];

                // Cancelling a booking marks it as cancelled in localStorage.
                const updatedBookings = allBookings.map(item => {
                    if (item.bookingReference === booking.bookingReference) {
                        return { ...item, status: 'Cancelled' };
                    }
                    return item;
                });

                localStorage.setItem('flydreamairBookings', JSON.stringify(updatedBookings));
                showManageMessage('Booking cancelled for demo purposes.');
                window.location.reload();
            });
        });

        document.querySelectorAll('.change-seat-btn').forEach(button => {
            button.addEventListener('click', function() {
                // Reuse the existing seat selection page for changing a saved seat.
                const localIndex = Number(this.dataset.index);
                const booking = bookings[localIndex];

                sessionStorage.setItem('activeBookingReference', booking.bookingReference);
                sessionStorage.setItem('flightData', JSON.stringify({
                    fromCity: booking.fromCity,
                    toCity: booking.toCity,
                    departDate: booking.departDate,
                    returnDate: booking.returnDate,
                    tripType: booking.tripType
                }));

                showManageMessage('Choose a new seat on the seat selection page.');
                window.location.href = '../../seat&services/html/seat.html';
            });
        });
    }

    // Choose which page state to show.
    if (!currentUser) {
        renderLoggedOut();
    } else if (!bookings.length) {
        renderNoBookings();
    } else {
        renderBookings();
    }
});

// Show a small message at the top of the Manage Booking card.
function showManageMessage(message) {
    const container = document.querySelector('.manage-booking-container');
    let box = document.getElementById('manage-message');

    if (!box) {
        box = document.createElement('div');
        box.id = 'manage-message';
        box.style.cssText = 'margin:12px 0;padding:12px;border-radius:10px;background:#fff7df;color:#5c4300;font-weight:700;text-align:center;';
        container.prepend(box);
    }

    box.textContent = message;
}
