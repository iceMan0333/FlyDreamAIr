const form = document.getElementById('registration-form');

form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Collect and clean up all form values before validation.
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const phone = document.getElementById('phone').value.trim();
    const dob = document.getElementById('dob').value;
    const terms = document.getElementById('terms').checked;

    // Check the form field-by-field so users know what to fix.
    resetValidation();
    let isValid = true;

    if (!username) { showError('username', 'Please enter a username.'); isValid = false; }
    if (!validateEmail(email)) { showError('email', 'Please enter a valid email.'); isValid = false; }
    if (password.length < 4) { showError('password', 'Password must be at least 4 characters for this demo.'); isValid = false; }
    if (password !== confirmPassword) { showError('confirm-password', 'Passwords do not match.'); isValid = false; }
    if (!phone) { showError('phone', 'Please enter a phone number.'); isValid = false; }
    if (!dob) { showError('dob', 'Please enter your date of birth.'); isValid = false; }
    if (!terms) { showStatus('You must agree to the terms of services and privacy policy.'); isValid = false; }

    if (!isValid) return;

    // Stop duplicate accounts from being created with the same email address.
    const users = JSON.parse(localStorage.getItem('flydreamairUsers') || '[]');
    if (users.some(user => user.email === email)) {
        showError('email', 'An account already exists with this email. Please log in.');
        return;
    }

    // Save the user and sign them in straight away for the demo flow.
    const newUser = { username, email, password, phone, dob, createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('flydreamairUsers', JSON.stringify(users));
    localStorage.setItem('flydreamairCurrentUser', JSON.stringify({ username, email, phone, dob }));

    showStatus('Account created and logged in successfully!');
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

// Show a message at the top of the sign-up form.
function showStatus(message) {
    let box = document.getElementById('form-status');
    if (!box) { box = document.createElement('div'); box.id = 'form-status'; box.style.cssText = 'margin:12px 0;padding:12px;border-radius:10px;background:#fff7df;color:#5c4300;font-weight:700;text-align:center;'; form.prepend(box); }
    box.textContent = message;
}
