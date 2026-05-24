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
    const returnTime = sessionStorage.getItem('returnTime');
    const passengerCount = Math.min(Math.max(parseInt(flightData?.passengerCount || '1', 10) || 1, 1), 9);
    const additionalPassengers = document.getElementById('additional-passengers');

    // If there is no selected flight, send the user back to the booking form.
    if (!flightData || !departureTime) {
        alert('Please select a flight before continuing.');
        window.location.href = '../../index.html#booking';
        return;
    }

    const flightDetails = document.querySelector('.flight-summary .flight-details');

    if (flightDetails) {
        flightDetails.innerHTML = `
            <p><strong>Trip Type:</strong> ${flightData.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}</p>
            <p><strong>Departure:</strong> ${departureTime}</p>
            <p><strong>Date:</strong> ${flightData.departDate}</p>
            ${returnTime ? `<p><strong>Return:</strong> ${returnTime}</p>` : ''}
            ${flightData.returnDate ? `<p><strong>Return Date:</strong> ${flightData.returnDate}</p>` : ''}
            <p><strong>Passengers:</strong> ${passengerCount}</p>
            <p><strong>Total Flight Price:</strong> $${flightFare}</p>
        `;
    }

    if (additionalPassengers) {
        additionalPassengers.innerHTML = Array.from({ length: passengerCount - 1 }, (_, index) => {
            const passengerNumber = index + 2;
            return `
                <div class="passenger-card">
                    <h3>Passenger ${passengerNumber}</h3>
                    <div class="input-container">
                        <label for="passenger-${passengerNumber}-name">Full Name:</label>
                        <input type="text" id="passenger-${passengerNumber}-name" name="passenger-${passengerNumber}-name" required>
                    </div>
                    <div class="input-container">
                        <label for="passenger-${passengerNumber}-passport">Passport Number:</label>
                        <input type="text" id="passenger-${passengerNumber}-passport" name="passenger-${passengerNumber}-passport" required>
                    </div>
                </div>
            `;
        }).join('');
    }
};

// Save passenger details and move to payment.
document.getElementById('confirmation-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Collect the passenger details from the form.
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const passport = document.getElementById('passport').value;
    const flightData = JSON.parse(sessionStorage.getItem('flightData') || 'null');
    const passengerCount = Math.min(Math.max(parseInt(flightData?.passengerCount || '1', 10) || 1, 1), 9);
    const passengers = [{ fullName, passport }];

    for (let passengerNumber = 2; passengerNumber <= passengerCount; passengerNumber++) {
        passengers.push({
            fullName: document.getElementById(`passenger-${passengerNumber}-name`)?.value.trim() || '',
            passport: document.getElementById(`passenger-${passengerNumber}-passport`)?.value.trim() || ''
        });
    }

    // Store the details so the next pages can show them.
    sessionStorage.setItem('passengerName', fullName);
    sessionStorage.setItem('passengers', JSON.stringify(passengers));
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('phone', phone);

    // Only continue when all required fields are filled.
    if (fullName && email && phone && passport && passengers.every(passenger => passenger.fullName && passenger.passport)) {
        console.log(`Passenger details saved successfully.\n\nFull Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}`);
        window.location.href = '../../cardDetails/html/cardDetails.html';
    } else {
        alert('Please fill out all required passenger fields.');
    }
});
