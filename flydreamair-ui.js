document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('flydreamairCurrentUser') || 'null');

    // Make the navigation look consistent on every page.
    // Older pages had slightly different nav markup, so this adds one profile icon.
    document.querySelectorAll('.deals-parent').forEach(function (nav) {
        const existingIcon = nav.querySelector('.profile-icon-link');
        const signIn = nav.querySelector('#sign-in, a[href$="login.html"]');
        const signUp = nav.querySelector('#sign-up');
        const profileTextLink = nav.querySelector('a[href$="profile.html"]');

        if (currentUser && signIn) {
            signIn.style.display = 'none';
        }

        if (profileTextLink) {
            profileTextLink.style.display = 'none';
        }

        if (currentUser && signUp) {
            const wrapper = signUp.closest('.sign-up-wrapper');
            if (wrapper) wrapper.style.display = 'none';
            else signUp.style.display = 'none';
        }

        if (existingIcon) return;

        const icon = document.createElement('a');
        icon.className = 'profile-icon-link';
        icon.href = currentUser ? getRelativeProfileHref() : getRelativeLoginHref();
        icon.setAttribute('aria-label', currentUser ? 'Open profile' : 'Sign in');
        icon.innerHTML = '<i class="fas fa-user-circle" aria-hidden="true"></i>';
        nav.appendChild(icon);
    });
});

// Choose the correct login link for root pages and nested pages.
function getRelativeLoginHref() {
    return window.location.pathname.includes('/html/') ? '../../login/html/login.html' : 'login/html/login.html';
}

// Choose the correct profile link for root pages and nested pages.
function getRelativeProfileHref() {
    return window.location.pathname.includes('/html/') ? '../../profile/html/profile.html' : 'profile/html/profile.html';
}
