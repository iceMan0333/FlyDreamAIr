/*
  Student project note:
  This file is part of the FlyDreamAir front-end demo. It has been kept simple and clearly commented so the page logic and layout are easy to follow.
*/

// Set up the login form.
// This demo checks accounts saved in localStorage instead of using a backend.
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the email and password entered by the user.
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    // Check the form before trying to log in.
    resetValidation();
    let isValid = true;

    if (!validateEmail(email)) { showError('email', 'Please enter a valid email.'); isValid = false; }
    if (!password) { showError('password', 'Please enter your password.'); isValid = false; }
    if (!isValid) return;

    // Find the matching account from localStorage.
    const users = JSON.parse(localStorage.getItem('flydreamairUsers') || '[]');
    const user = users.find(account => account.email === email && account.password === password);

    if (!user) {
        showStatus('No matching account found. Please sign up first or check your password.');
        return;
    }

    // Save the current user so other pages know someone is signed in.
    localStorage.setItem('flydreamairCurrentUser', JSON.stringify({
        username: user.username,
        email: user.email,
        phone: user.phone
    }));

    showStatus(`Welcome back, ${user.username}!`);

    // If login was required during booking, send the user back to that page.
    const pendingBookingUrl = sessionStorage.getItem('pendingBookingUrl');
    if (pendingBookingUrl) {
        sessionStorage.removeItem('pendingBookingUrl');
        window.location.href = pendingBookingUrl;
        return;
    }
    window.location.href = '../../index.html';
});

// Show an error beside a specific field.
function showError(fieldId, message) {
    const inputField = document.getElementById(fieldId);
    inputField.style.borderColor = 'red';
    let errorElem = inputField.parentElement.querySelector('.error-message');
    if (!errorElem) {
        errorElem = document.createElement('span');
        errorElem.classList.add('error-message');
        inputField.parentElement.appendChild(errorElem);
    }
    errorElem.textContent = message;
}

// Clear old validation messages before checking the form again.
function resetValidation() {
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    document.querySelectorAll('input').forEach(input => input.style.borderColor = '');
}

// Check that the email looks like a real email address.
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

// Show a message at the top of the login form.
function showStatus(message) {
    let box = document.getElementById('form-status');
    if (!box) { box = document.createElement('div'); box.id = 'form-status'; box.style.cssText = 'margin:12px 0;padding:12px;border-radius:10px;background:#fff7df;color:#5c4300;font-weight:700;text-align:center;'; loginForm.prepend(box); }
    box.textContent = message;
}
