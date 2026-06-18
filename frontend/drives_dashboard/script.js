// Drives Dashboard Integration Logic

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

    // Simple Micro-interaction for cards
    function setupCardInteractions() {
        document.querySelectorAll('.bg-surface-container-lowest').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    const grid = document.querySelector('main .grid.grid-cols-1');
    if (!grid) return;

    try {
        // 2. Fetch User's Applications to know which drives are already applied
        const appsRes = await fetch('/api/applications', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!appsRes.ok) throw new Error('Failed to load applications');
        const applications = await appsRes.json();
        const appliedDriveIds = new Set(applications.map(a => a.drive_id));

        // 3. Fetch Drives
        const res = await fetch('/api/drives');
        if (!res.ok) throw new Error('Failed to load drives');
        const drives = await res.json();

        // 4. Render Fetched Drives
        grid.innerHTML = '';
        if (drives.length === 0) {
            grid.innerHTML = `
                <div class="col-span-3 py-10 text-center text-on-surface-variant opacity-60">
                    No active recruitment drives at this time.
                </div>
            `;
            return;
        }

        drives.forEach(d => {
            const card = document.createElement('div');
            card.className = 'bg-surface-container-lowest border border-outline-variant rounded-2xl p-p-md shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between';
            const initials = (d.company || '').slice(0, 2).toUpperCase();
            const hasApplied = appliedDriveIds.has(d.id);

            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-6">
                        <div class="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center border border-outline-variant p-2">
                            <div class="w-full h-full flex items-center justify-center font-bold text-primary text-lg">${initials}</div>
                        </div>
                        <span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-caption text-caption">${d.type || 'FTE'}</span>
                    </div>
                    <h3 class="font-headline-md text-headline-md text-on-surface">${d.role || ''}</h3>
                    <p class="font-body-md text-body-md text-primary font-semibold mt-1">${d.company || ''}</p>
                    <div class="mt-6 space-y-3">
                        <div class="flex items-center gap-3 text-on-surface-variant"><span class="material-symbols-outlined text-outline">location_on</span><span class="font-body-md text-body-md">Location: Remote Friendly</span></div>
                        <div class="flex items-center gap-3 text-on-surface-variant"><span class="material-symbols-outlined text-outline">payments</span><span class="font-body-md text-body-md">Package: ${d.package || 'TBD'}</span></div>
                        <div class="flex items-center gap-3 text-on-surface-variant"><span class="material-symbols-outlined text-outline">calendar_today</span><span class="font-body-md text-body-md">Deadline: ${d.drive_date || 'TBD'}</span></div>
                    </div>
                </div>
                <div class="mt-auto pt-8 flex gap-3">
                    ${hasApplied
                        ? `<button class="flex-1 bg-surface-container text-on-surface-variant py-3 rounded-xl font-label-md text-label-md cursor-not-allowed" disabled>Applied</button>`
                        : `<button class="flex-1 bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md hover:shadow-md transition-all active:scale-95 apply-btn" data-drive-id="${d.id}">Apply Now</button>`
                    }
                    <button class="px-4 py-3 border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all"><span class="material-symbols-outlined">bookmark</span></button>
                </div>
            `;
            grid.appendChild(card);
        });

        setupCardInteractions();

        // 5. Apply Click Handlers
        grid.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const driveId = btn.getAttribute('data-drive-id');
                btn.disabled = true;
                btn.textContent = 'Applying...';

                try {
                    const res = await fetch('/api/apply', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ drive_id: parseInt(driveId) })
                    });

                    if (!res.ok) throw new Error('Application failed');
                    
                    alert('Successfully applied!');
                    location.reload();
                } catch (err) {
                    alert('Error: ' + err.message);
                    btn.disabled = false;
                    btn.textContent = 'Apply Now';
                }
            });
        });

    } catch (err) {
        console.error('Error fetching drives:', err);
    }
});