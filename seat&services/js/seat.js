/*
  Student project note:
  This file is part of the FlyDreamAir front-end demo. It has been kept simple and clearly commented so the page logic and layout are easy to follow.
*/

// Header navigation links for this page.
document.getElementById('help-link')?.addEventListener('click', function() {
    window.location.href = '../../help/html/help.html';
});

document.getElementById('sign-up')?.addEventListener('click', function() {
    window.location.href = '../../signup/html/signup.html';
});

document.getElementById('sign-in')?.addEventListener('click', function() {
    window.location.href = '../../login/html/login.html';
});

document.addEventListener('DOMContentLoaded', function() {

    // Set up the seat selection area.
    const seatGrid = document.getElementById('seat-grid');
    const confirmSeatNumber = document.getElementById('confirm-seat-number');
    const confirmButton = document.getElementById('confirm-button');
    const flightData = JSON.parse(sessionStorage.getItem('flightData') || 'null');
    const passengerCount = Math.min(Math.max(parseInt(flightData?.passengerCount || '1', 10) || 1, 1), 9);
    const selectedSeats = [];
    let confirmedSeat = '';
    let isSeatConfirmed = false;
    sessionStorage.removeItem('seatNumber');
    sessionStorage.removeItem('seatConfirmed');

    function updateSeatSummary() {
        confirmSeatNumber.innerHTML = selectedSeats.length ? selectedSeats.join(', ') : 'None';
        confirmButton.disabled = selectedSeats.length !== passengerCount;
        confirmButton.textContent = selectedSeats.length === passengerCount
            ? `Confirm ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}`
            : `Select ${passengerCount - selectedSeats.length} more`;
    }

    const rows = 10;
    const columns1And3 = ['A', 'B'];
    const columns2 = ['D', 'E', 'F'];
    const columns3 = ['H', 'J'];

    // These seats are unavailable in the demo.
    const bookedSeats = ['1A', '1E', '1J', '2D', '2F', '3A', '3E', '3H', '4B', '4J', '5B','5D', '5H', '6A', '6F', '7B', '7F', '8A', '8H', '9E', '10A', '10D', '10J'];

    // Create one seat button and attach the click behavior for choosing it.
    function createSeat(row, seatLabel) {
        const seatButton = document.createElement('button');
        seatButton.classList.add('seat', 'available');
        seatButton.textContent = `${row}${seatLabel}`;

        // Mark booked seats so they cannot be selected.
        if (bookedSeats.includes(`${row}${seatLabel}`)) {
            seatButton.classList.add('booked');
            seatButton.classList.remove('available');
        }

        // Select this seat when the user clicks it.
        seatButton.addEventListener('click', function() {
            if (!seatButton.classList.contains('booked')) {
                const seatNumber = `${row}${seatLabel}`;
                const existingIndex = selectedSeats.indexOf(seatNumber);

                if (existingIndex >= 0) {
                    selectedSeats.splice(existingIndex, 1);
                    seatButton.classList.remove('selected');
                } else {
                    if (selectedSeats.length >= passengerCount) {
                        alert(`You can select ${passengerCount} seat${passengerCount > 1 ? 's' : ''} for this booking.`);
                        return;
                    }

                    selectedSeats.push(seatNumber);
                    seatButton.classList.add('selected');
                }

                confirmedSeat = null;
                isSeatConfirmed = false;
                sessionStorage.removeItem('seatNumber');
                sessionStorage.removeItem('seatConfirmed');

                updateSeatSummary();
            }
        });

        return seatButton;
    }

    for (let row = 1; row <= rows; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('seat-row');

        // First seat group.
        const group1Div = document.createElement('div');
        group1Div.classList.add('seat-group');
        columns1And3.forEach(seatLabel => {
            const seatButton = createSeat(row, seatLabel);
            group1Div.appendChild(seatButton);
        });
        rowDiv.appendChild(group1Div);

        // Aisle after first group.
        const aisleDiv1 = document.createElement('div');
        aisleDiv1.classList.add('aisle');
        rowDiv.appendChild(aisleDiv1);

        // Middle seat group.
        const group2Div = document.createElement('div');
        group2Div.classList.add('seat-group');
        columns2.forEach(seatLabel => {
            const seatButton = createSeat(row, seatLabel);
            group2Div.appendChild(seatButton);
        });
        rowDiv.appendChild(group2Div);

        // Aisle after middle group.
        const aisleDiv2 = document.createElement('div');
        aisleDiv2.classList.add('aisle');
        rowDiv.appendChild(aisleDiv2);

        // Last seat group.
        const group3Div = document.createElement('div');
        group3Div.classList.add('seat-group');
        columns3.forEach(seatLabel => {
            const seatButton = createSeat(row, seatLabel);
            group3Div.appendChild(seatButton);
        });
        rowDiv.appendChild(group3Div);

        seatGrid.appendChild(rowDiv);

        // Add a row gap after every 5th row.
        if (row % 5 === 0) {
            const gapDiv = document.createElement('div');
            gapDiv.classList.add('row-gap');
            seatGrid.appendChild(gapDiv);
        }
    }

    updateSeatSummary();

    // Confirming locks the selected seat into sessionStorage for the next page.
    confirmButton.addEventListener('click', function() {
        if (selectedSeats.length === passengerCount) {
            const seatNumber = selectedSeats.join(', ');

            // Store the selected seat number for the next pages.
            sessionStorage.setItem('seatNumber', seatNumber);
            sessionStorage.setItem('seatConfirmed', 'true');

            const activeBookingReference = sessionStorage.getItem('activeBookingReference');
            if (activeBookingReference) {
                const bookings = JSON.parse(localStorage.getItem('flydreamairBookings') || '[]');
                const updatedBookings = bookings.map(booking =>
                    booking.bookingReference === activeBookingReference
                        ? { ...booking, seatNumber, status: booking.status === 'Cancelled' ? 'Cancelled' : 'Confirmed' }
                        : booking
                );
                localStorage.setItem('flydreamairBookings', JSON.stringify(updatedBookings));
            }

            console.log(`Seat ${seatNumber} has been confirmed.`);
            confirmedSeat = seatNumber;
            isSeatConfirmed = true;
            alert(`Seat selection confirmed: ${seatNumber}`);
            confirmButton.disabled = true;
            confirmButton.textContent = `Confirmed ${seatNumber}`;
        }
    });

    // Set up the onboard services counters.
    const servicePrices = {
        'chocolate-bars-qty': 6,
        'chips-qty': 8,
        'cookies-qty': 5,
        'rice-bowl-qty': 16,
        'sandwiches-qty': 14,
        'pasta-qty': 18,
        'salads-qty': 12,
        'coffee-qty': 4,
        'tea-qty': 4,
        'water-qty': 3,
        'orange-juice-qty': 5
    };

    // Add the visible price under each item name.
    function addServicePriceLabel(serviceId) {
        const item = document.getElementById(serviceId);
        if (!item) return;
        const name = item.querySelector(':scope > span');
        if (!name || item.querySelector('.service-price')) return;
        const label = document.createElement('small');
        label.className = 'service-price';
        label.textContent = `$${servicePrices[serviceId].toFixed(2)}`;
        name.appendChild(label);
    }

    // Create the extras total row.
    function ensureExtrasTotal() {
        let total = document.getElementById('onboard-services-total');
        if (total) return total;
        const servicesBox = document.querySelector('.onboard-services');
        if (!servicesBox) return null;
        const summary = document.createElement('div');
        summary.className = 'extras-total-row';
        summary.innerHTML = '<span>Extras Total</span><strong id="onboard-services-total">$0.00</strong>';
        servicesBox.appendChild(summary);
        return summary.querySelector('#onboard-services-total');
    }

    // Attach plus/minus behavior to one extras item.
    function handleCounter(serviceId) {
        const decreaseBtn = document.querySelector(`#${serviceId} .decrease`);
        const increaseBtn = document.querySelector(`#${serviceId} .increase`);
        const quantityDisplay = document.querySelector(`#${serviceId} .quantity`);
        const serviceCostPerItem = servicePrices[serviceId] || 0;
        let quantity = 0;

        addServicePriceLabel(serviceId);

        if (!decreaseBtn || !increaseBtn || !quantityDisplay) {
            return {
                getQuantity: () => 0,
                getTotalCost: () => 0
            };
        }

        increaseBtn.addEventListener('click', () => {
            quantity++;
            quantityDisplay.textContent = quantity;
            updateOnboardServicesTotal();
        });

        decreaseBtn.addEventListener('click', () => {
            if (quantity > 0) {
                quantity--;
                quantityDisplay.textContent = quantity;
                updateOnboardServicesTotal();
            }
        });

        return {
            getQuantity: () => quantity,
            getTotalCost: () => quantity * serviceCostPerItem
        };
    }

    // Initialize onboard services counters.
    const services = [
        'chocolate-bars-qty', 'chips-qty', 'cookies-qty', 'rice-bowl-qty',
        'sandwiches-qty', 'pasta-qty', 'salads-qty', 'coffee-qty',
        'tea-qty', 'water-qty', 'orange-juice-qty'
    ];

    const serviceHandlers = services.map(serviceId => handleCounter(serviceId));

    // Recalculate the extras total and save it for the payment page.
    function updateOnboardServicesTotal() {
        const totalCost = serviceHandlers.reduce((sum, handler) => sum + handler.getTotalCost(), 0);
        const onboardServicesTotalElement = ensureExtrasTotal();
        
        if (onboardServicesTotalElement) {
            onboardServicesTotalElement.textContent = `$${totalCost.toFixed(2)}`;
        }

        // Store the onboard services total for the payment page.
        sessionStorage.setItem('onboardServicesTotal', totalCost);
    }

    // Add the extras total row before the user selects any extras.
    ensureExtrasTotal();

    // Continue button only proceeds after a seat has been confirmed.
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#Continue')) return;
        event.preventDefault();

        // Make sure the seat number is stored before continuing.
        const seatNumber = confirmedSeat || sessionStorage.getItem('seatNumber');
        const confirmed = isSeatConfirmed || sessionStorage.getItem('seatConfirmed') === 'true';
        if (!seatNumber || !confirmed) {
            alert('Please confirm your seat selection before continuing.');
            console.log('Please confirm your seat selection before continuing.');
            return;
        }

        if (sessionStorage.getItem('activeBookingReference')) {
            sessionStorage.removeItem('activeBookingReference');
            console.log('Seat updated for this demo booking.');
            window.location.assign('../../manageBooking/html/mb.html');
            return;
        }

        sessionStorage.setItem('onboardServicesTotal', sessionStorage.getItem('onboardServicesTotal') || '0');

        // Continue to passenger confirmation after the seat is selected.
        window.location.assign('../../confirmation/html/confirmation.html'); 
    });
});
