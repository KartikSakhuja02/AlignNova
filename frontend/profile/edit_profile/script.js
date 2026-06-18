// Edit Profile Integration Logic

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

    // Fetch and populate current profile data
    try {
        const profileRes = await fetch('/api/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (profileRes.ok) {
            const profile = await profileRes.json();
            const fullNameInput = document.getElementById('full_name');
            if (fullNameInput) fullNameInput.value = profile.full_name || '';
            
            const emailInput = document.getElementById('email');
            if (emailInput) emailInput.value = profile.email || '';
            
            const phoneInput = document.getElementById('phone');
            if (phoneInput) phoneInput.value = profile.phone || '';
        }
    } catch (err) {
        console.error('Error loading profile details:', err);
    }

    // Save Action handler
    async function saveProfile(btn) {
        const full_name = document.getElementById('full_name')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const phone = document.getElementById('phone')?.value || '';

        btn.disabled = true;
        const originalContent = btn.textContent;
        btn.textContent = 'Saving...';

        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ full_name, email, phone })
            });

            if (!res.ok) throw new Error('Failed to save profile');

            alert('Profile updated successfully!');
            // Redirect back to profile page
            location.href = '/frontend/profile/profile_dashboard/index.html';
        } catch (err) {
            alert('Error: ' + err.message);
            btn.disabled = false;
            btn.textContent = originalContent;
        }
    }

    // Attach to desktop save button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveProfile(saveBtn));
    }

    // Attach to mobile save button
    const mobileSaveBtn = document.getElementById('mobile-save-btn');
    if (mobileSaveBtn) {
        mobileSaveBtn.addEventListener('click', () => saveProfile(mobileSaveBtn));
    }

    // Input highlight handlers
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('focus', function () {
            const group = this.closest('.space-y-1.5') || this.parentElement.parentElement;
            group.classList.add('border-primary/40');
        });

        input.addEventListener('blur', function () {
            const group = this.closest('.space-y-1.5') || this.parentElement.parentElement;
            group.classList.remove('border-primary/40');
        });
    });
});