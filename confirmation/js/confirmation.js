// Load the selected flight and passenger form when the page opens.
window.onload = function() {
    // The confirmation page should only work for signed-in users.
    const currentUser = JSON.parse(localStorage.getItem('flydreamairCurrentUser') || 'null');

    if (!currentUser) {
        sessionStorage.setItem('pendingBookingUrl', '../../confirmation/html/confirmation.html');
        alert('Please sign in before booking your ticket.');
        window.location.href = '../../login/html/login.html';
        return;
    }

    // Pre-fill the passenger fields from the demo profile.
    const nameInput = document.getElementById('full-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (nameInput && !nameInput.value) nameInput.value = currentUser.username || '';
    if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
    if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || '';

    // Get the selected flight from the previous page.
    const flightData = JSON.parse(sessionStorage.getItem('flightData'));
    const flightFare = sessionStorage.getItem('flightFare');
    const departureTime = sessionStorage.getItem('departureTime');

    // If there is no selected flight, send the user back to the booking form.
    if (!flightData || !departureTime) {
        alert('Please select a flight before continuing.');
        window.location.href = '../../index.html#booking';
        return;
    }

    const flightDetails = document.querySelector('.flight-summary .flight-details');

    // Show the one-way flight summary for this simplified demo.
    if (flightDetails) {
        flightDetails.innerHTML = `
            <p><strong>Departure:</strong> ${departureTime}</p>
            <p><strong>Date:</strong> ${flightData.departDate}</p>
            <p><strong>Flight Price:</strong> $${flightFare}</p>
        `;
    }
};

// Save passenger details and move to seat/extras selection.
document.getElementById('confirmation-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Collect the passenger details from the form.
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const passport = document.getElementById('passport').value;

    // Store the details so the next pages can show them.
    sessionStorage.setItem('passengerName', fullName);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('phone', phone);

    // Only continue when all required fields are filled.
    if (fullName && email && phone && passport) {
        console.log(`Passenger details saved successfully.\n\nFull Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}`);
        window.location.href = '../../seat&services/html/seat&service.html';
    } else {
        console.log('Please fill out all required fields.');
    }
});
