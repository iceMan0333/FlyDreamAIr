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
    const fromSuggestions = document.getElementById('from-suggestions');
    const toSuggestions = document.getElementById('to-suggestions');

    if (window.location.hash === '#booking' && bookingSection) {
        setTimeout(() => bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    document.querySelector('.subscribe-btn')?.addEventListener('click', function() {
        const email = document.querySelector('.subscribe-input')?.value.trim();
        console.log(email ? 'Thank you for subscribing to FlyDreamAir updates.' : 'Please enter your email address.');
    });

    document.querySelectorAll('input[name="trip"]').forEach((radio) => {
        radio.addEventListener('change', function() {
            const returnDate = document.getElementById('return-date');
            if (returnDate) returnDate.style.display = this.value === 'one-way' ? 'none' : 'block';
        });
    });

    function cleanDestinationName(value) {
        return (value || '').split(',')[0].trim();
    }

    // Build the flight results URL using only the fields shown in the demo.
    function buildFlightUrl(fromCity, toCity, departDate, returnDate, tripType, mode) {
        let url = `selectFlight/html/selection.html?from=${encodeURIComponent(cleanDestinationName(fromCity))}&departDate=${encodeURIComponent(departDate)}&tripType=${encodeURIComponent(tripType)}`;
        if (toCity) url += `&to=${encodeURIComponent(cleanDestinationName(toCity))}`;
        if (mode) url += `&mode=${encodeURIComponent(mode)}`;
        if (tripType === 'round-trip' && returnDate) url += `&returnDate=${encodeURIComponent(returnDate)}`;
        return url;
    }

    function defaultFutureDate(daysAhead) {
        const d = new Date();
        d.setDate(d.getDate() + daysAhead);
        return d.toISOString().split('T')[0];
    }

    // Search button. Blank destination shows all trending flights from Sydney.
    document.querySelector('.search-button button')?.addEventListener('click', function() {
        const fromCity = fromInput?.value.trim() || 'Sydney';
        const toCity = toInput?.value.trim();
        const departDate = document.getElementById('depart-date')?.value || defaultFutureDate(7);
        const returnDate = document.getElementById('return-date-input')?.value || defaultFutureDate(14);
        const tripType = document.querySelector('input[name="trip"]:checked')?.value || 'round-trip';

        if (toCity && cleanDestinationName(fromCity).toLowerCase() === cleanDestinationName(toCity).toLowerCase()) {
            alert('Please choose different departure and arrival cities.');
            return;
        }

        const searchMode = toCity ? 'single-route' : 'all-trending';
        sessionStorage.setItem('flightData', JSON.stringify({
            fromCity: cleanDestinationName(fromCity),
            toCity: toCity ? cleanDestinationName(toCity) : 'Trending destinations',
            departDate,
            returnDate,
            tripType,
            mode: searchMode
        }));
        window.location.href = buildFlightUrl(fromCity, toCity, departDate, returnDate, tripType, searchMode);
    });

    const CITY_SUGGESTIONS = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Hobart', 'Darwin', 'Gold Coast', 'Auckland', 'Wellington', 'Tokyo', 'Singapore', 'Jakarta', 'Bangkok', 'Dubai', 'London', 'Paris', 'New York', 'Los Angeles', 'Toronto'];

    // Use a local list for autocomplete instead of an external API.
    function fetchCitySuggestions(query) {
        const searchText = query.trim().toLowerCase();
        if (!searchText) return [];
        return CITY_SUGGESTIONS.filter(city => city.toLowerCase().startsWith(searchText)).slice(0, 6);
    }

    // Show matching city suggestions under the input box.
    function showSuggestions(inputElement, suggestionElement, suggestions) {
        if (!inputElement || !suggestionElement) return;
        suggestionElement.innerHTML = '';
        suggestionElement.style.display = suggestions.length ? 'block' : 'none';
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            li.addEventListener('click', () => {
                inputElement.value = suggestion;
                suggestionElement.innerHTML = '';
                suggestionElement.style.display = 'none';
            });
            suggestionElement.appendChild(li);
        });
    }

    // Show suggestions while typing in the From and To fields.
    fromInput?.addEventListener('focus', () => { if (toSuggestions) { toSuggestions.innerHTML = ''; toSuggestions.style.display = 'none'; } });
    toInput?.addEventListener('focus', () => { if (fromSuggestions) { fromSuggestions.innerHTML = ''; fromSuggestions.style.display = 'none'; } });
    fromInput?.addEventListener('input', () => showSuggestions(fromInput, fromSuggestions, fromInput.value.length >= 2 ? fetchCitySuggestions(fromInput.value) : []));
    toInput?.addEventListener('input', () => showSuggestions(toInput, toSuggestions, toInput.value.length >= 2 ? fetchCitySuggestions(toInput.value) : []));

    // Hide suggestion boxes when the user clicks somewhere else.
    document.addEventListener('click', function(event) {
        if (fromInput && fromSuggestions && !fromInput.contains(event.target) && !fromSuggestions.contains(event.target)) {
            fromSuggestions.innerHTML = ''; fromSuggestions.style.display = 'none';
        }
        if (toInput && toSuggestions && !toInput.contains(event.target) && !toSuggestions.contains(event.target)) {
            toSuggestions.innerHTML = ''; toSuggestions.style.display = 'none';
        }
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
            const returnDate = defaultFutureDate(14);
            sessionStorage.setItem('flightData', JSON.stringify({ fromCity, toCity: destination, departDate, returnDate, tripType: 'round-trip' }));
            window.location.href = buildFlightUrl(fromCity, destination, departDate, returnDate, 'round-trip', 'single-route');
        });
    });
    window.addEventListener('resize', updateCarouselPosition);
});
