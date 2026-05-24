/*
  Student project note:
  This file is part of the FlyDreamAir front-end demo. It has been kept simple and clearly commented so the page logic and layout are easy to follow.
*/

document.addEventListener('DOMContentLoaded', function () {
    const seatGrid = document.getElementById('seat-grid');
    const confirmSeatNumber = document.getElementById('confirm-seat-number');
    const confirmButton = document.getElementById('confirm-button');
    const currentSeatElement = document.getElementById('current-seat-number'); 
    let selectedSeat = null;

    // Retrieve passenger data from sessionStorage.
    const passengerName = getPassengerName();
    const email = getPassengerEmail();
    const phoneNumber = getPassengerPhone();
    let currentSeat = getSeatNumber();

    // Display the current seat number in the confirmation box.
    if (currentSeat) {
        currentSeatElement.textContent = currentSeat;
    }

    // Populate passenger information fields.
    populatePassengerInfo(passengerName, email, phoneNumber);


    // Seat availability is stored locally in this file.
    const seatData = [
        {
                "seatNumber": "1A",
                "availability": false
        },
        {
                "seatNumber": "1B",
                "availability": true
        },
        {
                "seatNumber": "1D",
                "availability": true
        },
        {
                "seatNumber": "1E",
                "availability": false
        },
        {
                "seatNumber": "1F",
                "availability": true
        },
        {
                "seatNumber": "1H",
                "availability": true
        },
        {
                "seatNumber": "1J",
                "availability": false
        },
        {
                "seatNumber": "2A",
                "availability": true
        },
        {
                "seatNumber": "2B",
                "availability": true
        },
        {
                "seatNumber": "2D",
                "availability": false
        },
        {
                "seatNumber": "2E",
                "availability": true
        },
        {
                "seatNumber": "2F",
                "availability": false
        },
        {
                "seatNumber": "2H",
                "availability": true
        },
        {
                "seatNumber": "2J",
                "availability": true
        },
        {
                "seatNumber": "3A",
                "availability": false
        },
        {
                "seatNumber": "3B",
                "availability": true
        },
        {
                "seatNumber": "3D",
                "availability": true
        },
        {
                "seatNumber": "3E",
                "availability": false
        },
        {
                "seatNumber": "3F",
                "availability": true
        },
        {
                "seatNumber": "3H",
                "availability": false
        },
        {
                "seatNumber": "3J",
                "availability": true
        },
        {
                "seatNumber": "4A",
                "availability": true
        },
        {
                "seatNumber": "4B",
                "availability": false
        },
        {
                "seatNumber": "4D",
                "availability": true
        },
        {
                "seatNumber": "4E",
                "availability": true
        },
        {
                "seatNumber": "4F",
                "availability": true
        },
        {
                "seatNumber": "4H",
                "availability": true
        },
        {
                "seatNumber": "4J",
                "availability": false
        },
        {
                "seatNumber": "5A",
                "availability": true
        },
        {
                "seatNumber": "5B",
                "availability": false
        },
        {
                "seatNumber": "5D",
                "availability": false
        },
        {
                "seatNumber": "5E",
                "availability": true
        },
        {
                "seatNumber": "5F",
                "availability": true
        },
        {
                "seatNumber": "5H",
                "availability": false
        },
        {
                "seatNumber": "5J",
                "availability": true
        },
        {
                "seatNumber": "6A",
                "availability": false
        },
        {
                "seatNumber": "6B",
                "availability": true
        },
        {
                "seatNumber": "6D",
                "availability": true
        },
        {
                "seatNumber": "6E",
                "availability": true
        },
        {
                "seatNumber": "6F",
                "availability": false
        },
        {
                "seatNumber": "6H",
                "availability": true
        },
        {
                "seatNumber": "6J",
                "availability": true
        },
        {
                "seatNumber": "7A",
                "availability": true
        },
        {
                "seatNumber": "7B",
                "availability": false
        },
        {
                "seatNumber": "7D",
                "availability": true
        },
        {
                "seatNumber": "7E",
                "availability": true
        },
        {
                "seatNumber": "7F",
                "availability": false
        },
        {
                "seatNumber": "7H",
                "availability": true
        },
        {
                "seatNumber": "7J",
                "availability": true
        },
        {
                "seatNumber": "8A",
                "availability": false
        },
        {
                "seatNumber": "8B",
                "availability": true
        },
        {
                "seatNumber": "8D",
                "availability": true
        },
        {
                "seatNumber": "8E",
                "availability": true
        },
        {
                "seatNumber": "8F",
                "availability": true
        },
        {
                "seatNumber": "8H",
                "availability": false
        },
        {
                "seatNumber": "8J",
                "availability": true
        },
        {
                "seatNumber": "9A",
                "availability": true
        },
        {
                "seatNumber": "9B",
                "availability": true
        },
        {
                "seatNumber": "9D",
                "availability": true
        },
        {
                "seatNumber": "9E",
                "availability": false
        },
        {
                "seatNumber": "9F",
                "availability": true
        },
        {
                "seatNumber": "9H",
                "availability": true
        },
        {
                "seatNumber": "9J",
                "availability": false
        },
        {
                "seatNumber": "10A",
                "availability": false
        },
        {
                "seatNumber": "10B",
                "availability": true
        },
        {
                "seatNumber": "10D",
                "availability": false
        },
        {
                "seatNumber": "10E",
                "availability": true
        },
        {
                "seatNumber": "10F",
                "availability": true
        },
        {
                "seatNumber": "10H",
                "availability": true
        },
        {
                "seatNumber": "10J",
                "availability": false
        }
];

    generateSeatLayout(seatData, currentSeat); 

    // Generate the seat layout with correct seat labels.
    function generateSeatLayout(seatData, currentSeat) {
        const rows = 10;
        const columns1And3 = ['A', 'B'];
        const columns2 = ['D', 'E', 'F'];
        const columns3 = ['H', 'J'];

        for (let row = 1; row <= rows; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('seat-row');

            // Create the first seat group.
            createSeatGroup(row, columns1And3, rowDiv, seatData, currentSeat);
            rowDiv.appendChild(createAisle());

            // Create the middle seat group.
            createSeatGroup(row, columns2, rowDiv, seatData, currentSeat);
            rowDiv.appendChild(createAisle());

            // Create the last seat group.
            createSeatGroup(row, columns3, rowDiv, seatData, currentSeat);

            seatGrid.appendChild(rowDiv);

            // Add a gap after every 5th row.
            if (row % 5 === 0) {
                const gapDiv = document.createElement('div');
                gapDiv.classList.add('row-gap');
                seatGrid.appendChild(gapDiv);
            }
        }
    }

    // Create individual seat groups and highlight the current seat.
    function createSeatGroup(row, columns, rowDiv, seatData, currentSeat) {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('seat-group');
        columns.forEach(column => {
            const seatNumber = `${row}${column}`;
            const seatStatus = seatData.find(seat => seat.seatNumber === seatNumber)?.availability;

            // Create the seat button element.
            const seatButton = document.createElement('button');
            seatButton.classList.add('seat');
            seatButton.textContent = seatNumber;

            // Apply styles for available, booked, or current seats.
            if (seatStatus) {
                seatButton.classList.add('available');
            } else {
                seatButton.classList.add('booked');
                seatButton.disabled = true;
            }

            // Highlight the current seat with a special class.
            if (seatNumber === currentSeat) {
                seatButton.classList.add('current-seat');
            }

            // Allow available seats to be selected.
            seatButton.addEventListener('click', function () {
                if (selectedSeat) {
                    selectedSeat.classList.remove('selected');
                }
                seatButton.classList.add('selected');
                selectedSeat = seatButton;

                // Update confirmation box.
                confirmSeatNumber.textContent = seatNumber;
                confirmButton.disabled = false; 
            });

            groupDiv.appendChild(seatButton);
        });
        rowDiv.appendChild(groupDiv);
    }

    // Create an aisle space between seat groups.
    function createAisle() {
        const aisleDiv = document.createElement('div');
        aisleDiv.classList.add('aisle');
        return aisleDiv;
    }

    // Fill the passenger information fields using sessionStorage data.
    function populatePassengerInfo(name, email, phone) {
        document.getElementById('passenger-name').value = name || 'N/A';
        document.getElementById('email').value = email || 'N/A';
        document.getElementById('phone').value = phone || 'N/A';
    }

    // Get the passenger name from sessionStorage.
    function getPassengerName() {
    return sessionStorage.getItem('passengerName') || '';
    }

    // Get the passenger email from sessionStorage.
    function getPassengerEmail() {
        return sessionStorage.getItem('email') || '';  
    }

    // Get the passenger phone number from sessionStorage.
    function getPassengerPhone() {
        return sessionStorage.getItem('phone') || '';  
    }

    // Get the seat number from sessionStorage.
    function getSeatNumber() {
        return sessionStorage.getItem('seatNumber') || '';  
    }

    // Switch between the sidebar sections.
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentSections = document.querySelectorAll('.content-section');

    sidebarItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(el => el.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            item.classList.add('active');
            contentSections[index].classList.add('active');
        });
    });

    // Set the initial active section.
    document.getElementById('seat-modification-tab').classList.add('active');
    document.getElementById('seat-modification-section').classList.add('active');
});

document.addEventListener('DOMContentLoaded', function () {
    // Get modal elements.
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const closeBtn = document.querySelector('.close-btn');
    const okBtn = document.getElementById('modal-ok-btn');

    // Show a modal message.
    function showModal(message, callback) {
        modalMessage.textContent = message; 
        modal.style.display = 'block'; 

       
        okBtn.onclick = closeBtn.onclick = function () {
            modal.style.display = 'none';
            if (callback) callback();
        };
    }

    // Show a message after seat change confirmation.
    document.getElementById('confirm-button').addEventListener('click', function () {
        showModal('Your seat has been changed successfully!', function () {
        });
    });

    // Show a message after saving personal details.
    document.querySelector('.save-button').addEventListener('click', function () {
        showModal('Personal details updated successfully.');
    });

    // Show a message after cancelling the flight.
    document.querySelector('.cancel-button').addEventListener('click', function () {
        showModal('Flight cancelled');
        setTimeout(function () {
            window.location.href = '../../index.html';
        }, 1200);
    });
});
