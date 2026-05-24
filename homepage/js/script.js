document.addEventListener('DOMContentLoaded', function() {
    /*
      Main homepage setup:
      - reads the flight search form
      - handles city suggestions
      - sends the user to the flight results page
      - lets destination cards act like quick booking shortcuts
    */
    const bookingSection = document.querySelector('.booking-section');
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');

    if (window.location.hash === '#booking' && bookingSection) {
        setTimeout(() => bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    document.querySelector('.subscribe-btn')?.addEventListener('click', function() {
        const email = document.querySelector('.subscribe-input')?.value.trim();
        console.log(email ? 'Thank you for subscribing to FlyDreamAir updates.' : 'Please enter your email address.');
    });

    function updateReturnDateVisibility() {
        const tripType = document.querySelector('input[name="trip"]:checked')?.value || 'round-trip';
        const returnDate = document.getElementById('return-date');
        const returnDateInput = document.getElementById('return-date-input');

        if (returnDate) returnDate.style.display = tripType === 'one-way' ? 'none' : 'block';
        if (tripType === 'one-way' && returnDateInput) returnDateInput.value = '';
    }

    document.querySelectorAll('input[name="trip"]').forEach((radio) => {
        radio.addEventListener('change', updateReturnDateVisibility);
    });
    updateReturnDateVisibility();

    function cleanDestinationName(value) {
        return (value || '').split(',')[0].trim();
    }

    // Build the flight results URL using only the fields shown in the demo.
    function getPassengerCount() {
        const passengerCount = parseInt(document.getElementById('passenger-count')?.value || '1', 10);
        return Math.min(Math.max(passengerCount || 1, 1), 9);
    }

    function buildFlightUrl(fromCity, toCity, departDate, returnDate, tripType, mode, passengerCount) {
        let url = `selectFlight/html/selection.html?from=${encodeURIComponent(cleanDestinationName(fromCity))}&departDate=${encodeURIComponent(departDate)}&tripType=${encodeURIComponent(tripType)}`;
        if (toCity) url += `&to=${encodeURIComponent(cleanDestinationName(toCity))}`;
        if (mode) url += `&mode=${encodeURIComponent(mode)}`;
        if (tripType === 'round-trip' && returnDate) url += `&returnDate=${encodeURIComponent(returnDate)}`;
        url += `&passengers=${encodeURIComponent(passengerCount || 1)}`;
        return url;
    }

    function defaultFutureDate(daysAhead) {
        const d = new Date();
        d.setDate(d.getDate() + daysAhead);
        return d.toISOString().split('T')[0];
    }

    // Search button. Both cities are required before showing flights.
    document.querySelector('.search-button button')?.addEventListener('click', function() {
        const fromCity = fromInput?.value.trim();
        const toCity = toInput?.value.trim();
        const departDate = document.getElementById('depart-date')?.value || defaultFutureDate(7);
        const tripType = document.querySelector('input[name="trip"]:checked')?.value || 'round-trip';
        const returnDate = tripType === 'round-trip'
            ? (document.getElementById('return-date-input')?.value || defaultFutureDate(14))
            : '';
        const passengerCount = getPassengerCount();

        if (!fromCity || !toCity) {
            alert('Please enter both departure and destination cities.');
            return;
        }

        if (toCity && cleanDestinationName(fromCity).toLowerCase() === cleanDestinationName(toCity).toLowerCase()) {
            alert('Please choose different departure and arrival cities.');
            return;
        }

        if (tripType === 'round-trip' && new Date(returnDate) < new Date(departDate)) {
            alert('Please choose a return date after your departure date.');
            return;
        }

        const searchMode = 'single-route';
        sessionStorage.setItem('flightData', JSON.stringify({
            fromCity: cleanDestinationName(fromCity),
            toCity: cleanDestinationName(toCity),
            departDate,
            returnDate,
            tripType,
            passengerCount,
            mode: searchMode
        }));
        window.location.href = buildFlightUrl(fromCity, toCity, departDate, returnDate, tripType, searchMode, passengerCount);
    });

    const slide = document.querySelector('.carousel-slide');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    const items = document.querySelectorAll('.carousel-item');
    let currentIndex = 0;
    const visibleItems = 3;

    // Older carousel controls are kept in case arrow buttons are present.
    function getItemWidth() { return items[0] ? items[0].offsetWidth + 20 : 0; }
    function updateCarouselPosition() { if (slide) slide.style.transform = `translateX(-${currentIndex * getItemWidth()}px)`; }
    rightArrow?.addEventListener('click', () => { currentIndex = currentIndex < items.length - visibleItems ? currentIndex + 1 : 0; updateCarouselPosition(); });
    leftArrow?.addEventListener('click', () => { currentIndex = currentIndex > 0 ? currentIndex - 1 : Math.max(items.length - visibleItems, 0); updateCarouselPosition(); });

    // Destination cards work as shortcuts into the normal flight-search flow.
    items.forEach((item) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const destination = cleanDestinationName(item.dataset.destination || item.querySelector('.city-name')?.textContent.trim());
            if (!destination) return;
            const fromCity = 'Sydney';
            const departDate = defaultFutureDate(7);
            sessionStorage.setItem('flightData', JSON.stringify({ fromCity, toCity: destination, departDate, returnDate: '', tripType: 'one-way', passengerCount: 1 }));
            window.location.href = buildFlightUrl(fromCity, destination, departDate, '', 'one-way', 'single-route', 1);
        });
    });
    window.addEventListener('resize', updateCarouselPosition);
});
