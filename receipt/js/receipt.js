/*
  Student project note:
  This file is part of the FlyDreamAir front-end demo. It has been kept simple and clearly commented so the page logic and layout are easy to follow.
*/

// Send the Manage Booking button to the manage booking page.
document.getElementById('mb')?.addEventListener('click', function() {
    window.location.href = '../../manageBooking/html/mb.html';
});

// Get the selected flight details from sessionStorage.
function getFlightData() {
    const flightData = sessionStorage.getItem('flightData');
    return flightData ? JSON.parse(flightData) : null;
}

// Get the passenger name saved during confirmation.
function getPassengerName() {
    return sessionStorage.getItem('passengerName') || 'John Doe';
}

// Get the selected seat number.
function getSeatNumber() {
    return sessionStorage.getItem('seatNumber') || 'N/A';
}

// Get the selected flight fare.
function getFlightFare() {
    return sessionStorage.getItem('flightFare') || 'N/A';
}

// Get the total for food and drink extras.
function getOnboardServicesTotal() {
    return sessionStorage.getItem('onboardServicesTotal') || '0';
}

// Display the selected flight and payment details on the receipt page.
function displayDynamicTicketInfo() {
    const flightDetails = getFlightData();
    const passengerName = getPassengerName();
    const seatNumber = getSeatNumber();
    const flightFare = getFlightFare();
    const onboardServicesTotal = getOnboardServicesTotal();
    const passengers = JSON.parse(sessionStorage.getItem('passengers') || '[]');

    if (!flightDetails) {
        console.log('No flight data found. Please start your booking process again.');
        return;
    }

    // Use a fixed tax amount for the demo receipt.
    const taxes = 50;
    const totalPaid = parseFloat(flightFare) + parseFloat(onboardServicesTotal) + taxes;
    const flightRoute = `${flightDetails.fromCity} to ${flightDetails.toCity}`;

    // Update the ticket details with the saved booking data.
    document.querySelector('.ticket-details').innerHTML = `
        <p><strong>Flight:</strong> ${flightRoute}</p>
        <p><strong>Trip Type:</strong> ${flightDetails.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}</p>
        <p><strong>Date:</strong> ${flightDetails.departDate}</p>
        ${flightDetails.returnDate ? `<p><strong>Return Date:</strong> ${flightDetails.returnDate}</p>` : ''}
        <p><strong>Class:</strong> Economy</p>
        <p><strong>Passenger${passengers.length > 1 ? 's' : ''}:</strong> ${passengers.length ? passengers.map(passenger => passenger.fullName).join(', ') : passengerName}</p>
        <p><strong>Seat Number:</strong> ${seatNumber}</p>
        <p><strong>Booking Reference:</strong> ${sessionStorage.getItem('latestBookingReference') || 'AJF5012464'}</p>
    `;

    // Update the receipt details with fare, extras, tax, and total.
    document.querySelector('.receipt-details').innerHTML = `
        <p><strong>Flight Fare:</strong> $${flightFare}</p>
        <p><strong>Taxes & Fees:</strong> $${taxes}</p>
        <p><strong>Food & Drinks:</strong> $${onboardServicesTotal}</p>
        <p><strong>Total Paid:</strong> $${totalPaid.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> Credit Card</p>
        <p><strong>Transaction ID:</strong> TXN987654321</p>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    // Fill the receipt and ticket when the page loads.
    displayDynamicTicketInfo();

    // Set up the download buttons.
    const downloadReceiptBtn = document.getElementById('download-receipt');
    const downloadTicketBtn = document.getElementById('download-ticket');

    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', function() {
            downloadReceipt();
        });
    }

    if (downloadTicketBtn) {
        downloadTicketBtn.addEventListener('click', function() {
            downloadTicket();
        });
    }
});

// Download the receipt text.
function downloadReceipt() {
    const content = document.querySelector('.receipt-details').innerText;
    downloadFile(content, 'Receipt.txt', 'text/plain');
}

// Download the ticket text.
function downloadTicket() {
    const content = document.querySelector('.ticket-details').innerText;
    downloadFile(content, 'Ticket.txt', 'text/plain');
}

// Create a temporary text file and trigger the download.
function downloadFile(content, fileName, fileType) {
    const blob = new Blob([content], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}
