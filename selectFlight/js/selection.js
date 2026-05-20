document.addEventListener('DOMContentLoaded', function() {

    const urlParams = new URLSearchParams(window.location.search);
    const fromCity = normalizeCity(urlParams.get('from') || 'Sydney');
    const selectedToCity = normalizeCity(urlParams.get('to') || '');
    const departDate = urlParams.get('departDate') || '';
    const returnDate = urlParams.get('returnDate') || '';
    const tripType = urlParams.get('tripType') || 'one-way';
    const mode = urlParams.get('mode') || (selectedToCity ? 'single-route' : 'all-trending');

    const departureDate = document.getElementById('departure-date');
    const returnDateInput = document.getElementById('return-date');
    if (departureDate && departDate) departureDate.value = departDate;
    if (returnDateInput && returnDate) returnDateInput.value = returnDate;

    const resultsContainer = document.getElementById('flight-results');
    const resultsCount = document.getElementById('results-count');
    const showMore = document.querySelector('.show-more-results-btn');
    const selectedFlightDisplay = document.createElement('div');
    const errorMessage = document.createElement('div');
    let visibleCount = 0;
    let allFlights = [];

    document.querySelector('.date-selection')?.appendChild(errorMessage);
    errorMessage.id = 'error-message';

    document.querySelector('.results')?.insertBefore(selectedFlightDisplay, showMore || null);
    selectedFlightDisplay.id = 'selected-flight';

    const trendingDestinations = ['Paris', 'Tokyo', 'Reykjavik', 'Banff', 'Dubai'];
    const flightTimes = [
        ['8:15 AM', '9:50 AM'],
        ['9:00 AM', '10:35 AM'],
        ['10:30 AM', '12:00 PM'],
        ['11:45 AM', '1:20 PM'],
        ['1:10 PM', '2:45 PM'],
        ['3:35 PM', '5:10 PM'],
        ['5:00 PM', '6:35 PM'],
        ['7:20 PM', '8:55 PM'],
        ['9:15 PM', '10:50 PM']
    ];
    const basePrices = [230, 245, 250, 265, 285, 310, 330, 360, 390];
    const destinationPriceOffsets = {
        Paris: 620,
        Tokyo: 480,
        Reykjavik: 700,
        Banff: 540,
        Dubai: 430
    };

    // Make sure the return date is not before the departure date.
    function validateDates() {
        if (!departureDate || !returnDateInput) return;
        const departureValue = new Date(departureDate.value);
        const returnValue = new Date(returnDateInput.value);
        if (returnDateInput.value && returnValue < departureValue) {
            errorMessage.textContent = 'Return date cannot be earlier than the departure date.';
            errorMessage.style.color = 'red';
        } else {
            errorMessage.textContent = '';
        }
    }

    // Format the date so it looks nicer on the flight cards.
    function formatDisplayDate(value) {
        if (!value) return 'Date not selected';
        const date = new Date(value + 'T00:00:00');
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Clean city names so values like "Paris, France" become "Paris".
    function normalizeCity(value) {
        return (value || '').split(',')[0].trim();
    }

    // Create 9 demo flight times for one destination.
    function createFlightsForDestination(destination) {
        const offset = destinationPriceOffsets[destination] || 0;
        return flightTimes.map((times, index) => ({
            fromCity,
            toCity: destination,
            departTime: times[0],
            arriveTime: times[1],
            price: basePrices[index] + offset
        }));
    }

    // Build either one route or all trending destination routes.
    function buildFlightList() {
        if (mode === 'all-trending' && !selectedToCity) {
            return trendingDestinations.flatMap(destination => createFlightsForDestination(destination));
        }
        return createFlightsForDestination(selectedToCity || 'Melbourne');
    }

    // Create one flight card and attach its click events.
    function createFlightCard(flight) {
        const card = document.createElement('div');
        card.className = 'flight-card';
        card.dataset.from = flight.fromCity;
        card.dataset.to = flight.toCity;
        card.dataset.price = String(flight.price);
        card.dataset.departureTime = `${flight.fromCity} ${flight.departTime} -> ${flight.toCity} ${flight.arriveTime}`;

        card.innerHTML = `
            <div>
                <div class="flight-time">
                    <span class="flight-route-text">${flight.fromCity} ${flight.departTime} -> ${flight.toCity} ${flight.arriveTime}</span>
                    <span class="flight-date">${formatDisplayDate(departDate)}</span>
                </div>
            </div>
            <div class="flight-price">
                <div>$${flight.price}</div>
                <button class="select-btn">Select</button>
            </div>
        `;

        card.addEventListener('click', () => selectFlight(card));
        card.querySelector('.select-btn')?.addEventListener('click', function(event) {
            event.stopPropagation();
            selectFlight(card);
            const nextUrl = '../../confirmation/html/confirmation.html';
            if (!requireLoginForBooking(nextUrl)) return;
            window.location.href = nextUrl;
        });

        return card;
    }

    // Show 9 more flight cards each time the button is clicked.
    function renderMoreFlights() {
        if (!resultsContainer) return;
        const nextFlights = allFlights.slice(visibleCount, visibleCount + 9);
        nextFlights.forEach(flight => resultsContainer.appendChild(createFlightCard(flight)));
        visibleCount += nextFlights.length;
        if (showMore) showMore.style.display = visibleCount < allFlights.length ? '' : 'none';
    }

    // Save the selected card details for the confirmation page.
    function selectFlight(card) {
        document.querySelectorAll('.flight-card').forEach(item => item.classList.remove('selected'));
        card.classList.add('selected');

        const price = card.dataset.price || '230';
        const departureTime = card.dataset.departureTime || '';
        const cardFromCity = card.dataset.from || fromCity;
        const cardToCity = card.dataset.to || selectedToCity || 'Melbourne';

        selectedFlightDisplay.textContent = `Selected Flight: ${departureTime}, Price: $${price}`;
        selectedFlightDisplay.style.fontWeight = 'bold';
        selectedFlightDisplay.style.marginTop = '20px';

        sessionStorage.setItem('flightFare', price);
        sessionStorage.setItem('departureTime', departureTime);
        sessionStorage.setItem('returnTime', '');
        sessionStorage.setItem('selectedRoute', JSON.stringify({
            fromCity: cardFromCity,
            toCity: cardToCity,
            departDate,
            returnDate,
            tripType
        }));
        sessionStorage.setItem('flightData', JSON.stringify({
            fromCity: cardFromCity,
            toCity: cardToCity,
            departDate,
            returnDate,
            tripType
        }));
    }

    // Check whether a user is signed in.
    function isLoggedIn() {
        return Boolean(JSON.parse(localStorage.getItem('flydreamairCurrentUser') || 'null'));
    }

    // Ask the user to sign in before they can continue booking.
    function requireLoginForBooking(nextUrl) {
        if (isLoggedIn()) return true;
        sessionStorage.setItem('pendingBookingUrl', nextUrl);
        alert('Please sign in before booking your ticket.');
        window.location.href = '../../login/html/login.html';
        return false;
    }

    departureDate?.addEventListener('change', validateDates);
    returnDateInput?.addEventListener('change', validateDates);
    showMore?.addEventListener('click', renderMoreFlights);

    // Sort the flights by price.
    allFlights = buildFlightList();
    allFlights.sort((a, b) => a.price - b.price);
    if (resultsCount) resultsCount.textContent = `${allFlights.length} Results`;
    renderMoreFlights();
});
