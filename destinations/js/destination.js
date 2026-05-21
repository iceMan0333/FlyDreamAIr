document.addEventListener("DOMContentLoaded", () => {
    // Get the filter dropdown and all destination cards.
    const filter = document.getElementById("filter");
    const destinationCards = document.querySelectorAll(".destination-card");

    // Filter the destination cards by domestic, international, or all.
    filter?.addEventListener("change", function () {
        const filterValue = this.value;

        destinationCards.forEach((card) => {
            const type = card.getAttribute("data-type");
            
            if (filterValue === "all" || type === filterValue) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });

    // Create a future date for the demo booking flow.
    function defaultFutureDate(daysAhead) {
        const d = new Date();
        d.setDate(d.getDate() + daysAhead);
        return d.toISOString().split('T')[0];
    }

    // Clean the destination name so "Paris, France" becomes "Paris".
    function cleanDestinationName(value) {
        return (value || '').split(',')[0].trim();
    }

    // Send the user from a destination card to the flight-results page.
    function bookDestination(destination) {
        const fromCity = 'Sydney';
        const toCity = cleanDestinationName(destination);
        const departDate = defaultFutureDate(7);
        const returnDate = defaultFutureDate(14);

        // Store the selected destination details for the next pages.
        sessionStorage.setItem('flightData', JSON.stringify({
            fromCity,
            toCity,
            departDate,
            returnDate,
            tripType: 'round-trip'
        }));

        // Open the flight selection page with the selected destination in the URL.
        window.location.href = `../../selectFlight/html/selection.html?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&departDate=${encodeURIComponent(departDate)}&returnDate=${encodeURIComponent(returnDate)}&tripType=round-trip`;
    }

    // Make each destination card clickable.
    destinationCards.forEach((card) => {
        const title = card.querySelector('h3')?.textContent || card.querySelector('img')?.alt || '';

        // Add a Book Flight button if the card does not already have one.
        if (!card.querySelector('.destination-book-btn')) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'destination-book-btn';
            button.textContent = 'Book Flight';
            card.querySelector('.destination-info')?.appendChild(button);
        }

        // Let the whole card start the booking flow.
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => bookDestination(title));

        // Let the Book Flight button also start the booking flow.
        card.querySelector('.destination-book-btn')?.addEventListener('click', (event) => {
            event.stopPropagation();
            bookDestination(title);
        });
    });
});
