// Profile Dashboard Integration Logic

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Token and Perform Auth Check
    const token = (document.cookie.split('; ').find(r => r.startsWith('access_token=')) || '').split('=')[1];
    if (!token) {
        location.href = '/frontend/signin/signin_page/index.html';
        return;
    }

    // Logout Button Handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.cookie = 'access_token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            location.href = '/frontend/signin/signin_page/index.html';
        });
    }

    // Sticky header shadow on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 20) {
            header.classList.add('shadow-sm');
        } else {
            header.classList.remove('shadow-sm');
        }
    });

    try {
        // 2. Fetch User Profile
        const res = await fetch('/api/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) {
            document.cookie = 'access_token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            location.href = '/frontend/signin/signin_page/index.html';
            return;
        }
        const profile = await res.json();

        // 3. Update HTML fields
        const profileName = document.getElementById('profile-name');
        if (profileName) profileName.textContent = profile.full_name || profile.username;

        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) profileEmail.textContent = profile.email || 'No email set';

        const profilePhone = document.getElementById('profile-phone');
        if (profilePhone) profilePhone.textContent = profile.phone || 'No phone set';

        // Also update name in the top app bar header
        const headerName = document.querySelector('header p.font-bold'); // If it exists
        // Wait, does it exist? In profile dashboard top bar, there's Alex Rivera image. Let's make sure it updates if there's any text element.
        // Wait, the profile page top bar doesn't have name text next to the image. But it's good to keep the check.

    } catch (err) {
        console.error('Error fetching profile:', err);
    }
});