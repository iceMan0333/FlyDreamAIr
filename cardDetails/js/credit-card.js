document.addEventListener('DOMContentLoaded', function() {

    // Get the flight fare saved from the selected flight.
    const flightFare = sessionStorage.getItem('flightFare') || '230';
    
    // Get the food and drink total from the seat/services page.
    const onboardServicesTotal = sessionStorage.getItem('onboardServicesTotal') || '0';

    // Update the purchase summary shown beside the card form.
    document.getElementById('flight-fare').textContent = `$${Number(flightFare).toFixed(2)}`;
    
    // Show "None" when no onboard services were selected.
    if (onboardServicesTotal === '0') {
        document.getElementById('onboard-services-cost').textContent = 'None';
    } else {
        document.getElementById('onboard-services-cost').textContent = `$${Number(onboardServicesTotal).toFixed(2)}`;
    }

    // Calculate the total amount including taxes and services.
    const taxes = 50;
    const totalAmount = Number(flightFare || 0) + Number(onboardServicesTotal || 0) + taxes;

    // Update the total amount in the purchase summary.
    document.getElementById('total-amount').textContent = `$${totalAmount.toFixed(2)}`;

    const form = document.getElementById('credit-card-form');
    if (form) {
        form.noValidate = true;
        ensurePaymentMessage();
    }
});


// Save the completed booking in localStorage for the Manage Booking page.
function saveDemoBooking() {
    const currentUser = JSON.parse(localStorage.getItem('flydreamairCurrentUser') || 'null');
    const flightData = JSON.parse(sessionStorage.getItem('flightData') || 'null');
    if (!flightData) return null;

    const flightFare = sessionStorage.getItem('flightFare') || '0';
    const onboardServicesTotal = sessionStorage.getItem('onboardServicesTotal') || '0';
    const taxes = 50;
    const totalPaid = parseFloat(flightFare || 0) + parseFloat(onboardServicesTotal || 0) + taxes;
    const bookingReference = 'FDA' + Date.now().toString().slice(-7);

    // Build one booking object from the saved flight, passenger, seat, and payment details.
    const booking = {
        bookingReference,
        ownerEmail: currentUser ? currentUser.email : 'guest',
        passengerName: sessionStorage.getItem('passengerName') || (currentUser ? currentUser.username : 'Guest Passenger'),
        email: sessionStorage.getItem('email') || (currentUser ? currentUser.email : ''),
        phone: sessionStorage.getItem('phone') || (currentUser ? currentUser.phone : ''),
        fromCity: flightData.fromCity,
        toCity: flightData.toCity,
        departDate: flightData.departDate,
        returnDate: flightData.returnDate || '',
        tripType: flightData.tripType || 'round-trip',
        departureTime: sessionStorage.getItem('departureTime') || '',
        returnTime: sessionStorage.getItem('returnTime') || '',
        seatNumber: sessionStorage.getItem('seatNumber') || 'Not selected',
        flightFare,
        onboardServicesTotal,
        taxes,
        totalPaid: totalPaid.toFixed(2),
        status: 'Confirmed',
        createdAt: new Date().toISOString()
    };

    // Add the new booking to the saved bookings list.
    const bookings = JSON.parse(localStorage.getItem('flydreamairBookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('flydreamairBookings', JSON.stringify(bookings));
    sessionStorage.setItem('latestBookingReference', bookingReference);
    return booking;
}

document.getElementById('credit-card-form').addEventListener('submit', function(event) {

    // Stop the form from refreshing the page.
    event.preventDefault();
    clearPaymentErrors();

    // Collect and clean the card form values.
    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.replace(/\s+/g, '');
    const expiryDate = document.getElementById('expiry-date').value.trim();
    const cvv = document.getElementById('cvv').value.trim();
    const billingAddress = document.getElementById('billing-address').value.trim();

    if (!cardName) {
        showPaymentMessage('Please enter the cardholder name.', 'card-name');
        return;
    }

    if (!cardNumber) {
        showPaymentMessage('Please enter your card number.', 'card-number');
        return;
    }

    // Validate the card number.
    if (!isValidCardNumber(cardNumber)) {
        showPaymentMessage('Invalid card number. Please enter exactly 16 digits.', 'card-number');
        return;
    }

    if (!expiryDate) {
        showPaymentMessage('Please enter the expiry date in MM/YY format.', 'expiry-date');
        return;
    }

    // Validate the expiry date.
    if (!isValidExpiryDate(expiryDate)) {
        showPaymentMessage('Invalid expiry date. Use MM/YY and make sure the card has not expired.', 'expiry-date');
        return;
    }

    if (!cvv) {
        showPaymentMessage('Please enter the CVV.', 'cvv');
        return;
    }

    // Validate the CVV.
    if (!/^\d{3}$/.test(cvv)) {
        showPaymentMessage('Invalid CVV. It must be a 3-digit number.', 'cvv');
        return;
    }

    if (!billingAddress) {
        showPaymentMessage('Please enter the billing address.', 'billing-address');
        return;
    }

    // If everything is valid, save the booking and go to the receipt.
    if (cardName && cardNumber && expiryDate && cvv && billingAddress) {
        const booking = saveDemoBooking();
        showPaymentMessage('Payment accepted. Redirecting to your receipt...', null, 'success');
        console.log('Payment processed successfully!\nThank you for booking with FlyDreamAir.' + (booking ? '\nBooking Reference: ' + booking.bookingReference : ''));
        
        // Store the cardholder name for the receipt/payment flow.
        sessionStorage.setItem('cardHolderName', cardName);

        // Redirect to the receipt page.
        window.location.href = '../../receipt/html/receipt.html';
    } else {
        showPaymentMessage('Please fill out all required fields.');
    }
});

// Create the payment message box if it does not already exist.
function ensurePaymentMessage() {
    let message = document.getElementById('payment-message');
    if (message) return message;
    const form = document.getElementById('credit-card-form');
    if (!form) return null;
    message = document.createElement('div');
    message.id = 'payment-message';
    message.className = 'payment-message';
    message.setAttribute('role', 'alert');
    form.prepend(message);
    return message;
}

// Show a payment error or success message.
function showPaymentMessage(text, fieldId, type = 'error') {
    const message = ensurePaymentMessage();
    if (message) {
        message.textContent = text;
        message.className = `payment-message show ${type === 'success' ? 'success' : ''}`.trim();
    }
    if (fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('field-error');
            field.focus();
        }
    }
}

// Clear old payment messages and field highlights.
function clearPaymentErrors() {
    const message = ensurePaymentMessage();
    if (message) {
        message.textContent = '';
        message.className = 'payment-message';
    }
    document.querySelectorAll('.field-error').forEach(field => field.classList.remove('field-error'));
}

// Check that the card number is exactly 16 digits.
function isValidCardNumber(cardNumber) {
    return cardNumber.length === 16 && /^\d{16}$/.test(cardNumber);
}

// Check that the expiry date is MM/YY and still in the future.
function isValidExpiryDate(expiryDate) {
    const match = expiryDate.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/);
    if (!match) return false;

    const month = parseInt(match[1]);
    const year = parseInt('20' + match[2]);

    const currentDate = new Date();
    const expiry = new Date(year, month);

    return expiry > currentDate;
}

// Add spaces while the user types the card number.
document.getElementById('card-number').addEventListener('input', function(event) {
    const input = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const formattedCardNumber = input.match(/.{1,4}/g)?.join(' ') || input;
    event.target.value = formattedCardNumber;
});

// Add the slash while the user types the expiry date.
document.getElementById('expiry-date').addEventListener('input', function(event) {
    const input = event.target.value.replace(/\//g, '').replace(/[^0-9]/g, '');

    if (input.length >= 2) {
        event.target.value = input.substring(0, 2) + '/' + input.substring(2, 4);
    }
});
