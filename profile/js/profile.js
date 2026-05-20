/*
  Student project note:
  This file is part of the FlyDreamAir front-end demo. It has been kept simple and clearly commented so the page logic and layout are easy to follow.
*/

// Load the current user and saved profile details from localStorage.
const currentUser = JSON.parse(localStorage.getItem('flydreamairCurrentUser') || 'null');
const users = JSON.parse(localStorage.getItem('flydreamairUsers') || '[]');

// Send logged-out users back to the login page.
if (!currentUser) {
    window.location.href = '../../login/html/login.html';
}

// Use the full saved account if it exists, otherwise use the current user data.
const fullUser = users.find(user => user.email === currentUser.email) || currentUser;

// Show a short message after saving profile changes.
function showMessage(text) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.classList.add('show');

    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

// Create initials for the profile avatar.
function getInitials(name) {
    return (name || 'FD')
        .split(/\s+/)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

// Fill the profile page with the saved account details.
document.getElementById('avatar').textContent = getInitials(fullUser.username);
document.getElementById('profileName').textContent = fullUser.username || 'Your Profile';
document.getElementById('profileEmail').textContent = fullUser.email || '';
document.getElementById('username').value = fullUser.username || '';
document.getElementById('email').value = fullUser.email || '';
document.getElementById('phone').value = fullUser.phone || '';
document.getElementById('dob').value = fullUser.dob || '';

// Load profile preference toggles.
const settings = JSON.parse(localStorage.getItem('flydreamairSettings') || '{}');

document.getElementById('emailUpdates').checked = settings.emailUpdates ?? true;
document.getElementById('smsReminders').checked = settings.smsReminders ?? false;
document.getElementById('savePassenger').checked = settings.savePassenger ?? true;

// Save edited passenger details.
document.getElementById('profileForm').addEventListener('submit', event => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const dob = document.getElementById('dob').value;

    // Update the matching account in the saved users list.
    const updatedUsers = users.map(user => {
        if (user.email === currentUser.email) {
            return { ...user, username, phone, dob };
        }
        return user;
    });

    localStorage.setItem('flydreamairUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('flydreamairCurrentUser', JSON.stringify({ ...currentUser, username, phone, dob }));

    // Refresh the visible profile card after saving.
    document.getElementById('profileName').textContent = username;
    document.getElementById('avatar').textContent = getInitials(username);
    showMessage('Profile saved.');
});

// Save notification preferences.
document.getElementById('saveSettings').addEventListener('click', () => {
    const updatedSettings = {
        emailUpdates: document.getElementById('emailUpdates').checked,
        smsReminders: document.getElementById('smsReminders').checked,
        savePassenger: document.getElementById('savePassenger').checked
    };

    localStorage.setItem('flydreamairSettings', JSON.stringify(updatedSettings));
    showMessage('Settings saved.');
});

// Log out and return to the homepage.
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('flydreamairCurrentUser');
    window.location.href = '../../index.html';
});

// Show recent bookings that belong to the logged-in user.
const bookings = JSON.parse(localStorage.getItem('flydreamairBookings') || '[]')
    .filter(booking => booking.ownerEmail === currentUser.email);

const bookingSummary = document.getElementById('bookingSummary');

bookingSummary.innerHTML = bookings.length
    ? bookings.slice(0, 3).map(booking => `
        <div class="booking-item">
            <strong>${booking.fromCity} to ${booking.toCity}</strong><br>
            Ref: ${booking.bookingReference}<br>
            Status: ${booking.status}<br>
            Seat: ${booking.seatNumber || 'Not selected'}
        </div>
    `).join('')
    : '<p>No bookings yet. Book a flight to see it here.</p>';
