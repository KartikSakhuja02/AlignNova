// Students Dashboard Integration Logic

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Token and Perform Auth Check
    const token = (document.cookie.split('; ').find(r => r.startsWith('access_token=')) || '').split('=')[1];
    if (!token) {
        location.href = '/frontend/signin/signin_page/index.html';
        return;
    }

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('shadow-sm');
        } else {
            header.classList.remove('shadow-sm');
        }
    });

    // Logout Button Handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.cookie = 'access_token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            location.href = '/frontend/signin/signin_page/index.html';
        });
    }

    try {
        // 2. Fetch Profile Info
        const profileRes = await fetch('/api/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!profileRes.ok) {
            // Token expired or invalid
            document.cookie = 'access_token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            location.href = '/frontend/signin/signin_page/index.html';
            return;
        }
        const profile = await profileRes.json();

        // Update name in Header and Greeting
        const headerName = document.querySelector('header p.font-bold');
        if (headerName) headerName.textContent = profile.full_name || profile.username;

        const greeting = document.querySelector('section.bg-primary-container h2');
        if (greeting) {
            const firstName = (profile.full_name || profile.username).split(' ')[0];
            greeting.textContent = `Welcome back, ${firstName}!`;
        }

        // 3. Fetch applications to know what has been applied to
        const appsRes = await fetch('/api/applications', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!appsRes.ok) throw new Error('Failed to load applications');
        const applications = await appsRes.json();
        const appliedDriveIds = new Set(applications.map(a => a.drive_id));

        // Render Application Tracker Table
        renderApplications(applications);

        // Update statistics cards
        updateStats(applications);

        // 4. Fetch Drives and Render
        const drivesRes = await fetch('/api/drives');
        if (!drivesRes.ok) throw new Error('Failed to load placement drives');
        const drives = await drivesRes.json();
        renderDrives(drives, appliedDriveIds);

    } catch (err) {
        console.error('Initialization error:', err);
    }

    // Render applications to the tracker table
    function renderApplications(apps) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (apps.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-10 py-8 text-center text-on-surface-variant font-body-md opacity-60">
                        No applications submitted yet. Apply to some drives below!
                    </td>
                </tr>
            `;
            return;
        }

        apps.forEach(app => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-surface-bright transition-colors group';

            const initials = (app.company || 'DR').slice(0, 3).toUpperCase();
            
            // Choose status badge styling
            let badgeClass = 'bg-primary/10 text-primary';
            let statusText = app.status;
            if (app.status === 'approved' || app.status === 'Selected' || app.status === 'Shortlisted') {
                badgeClass = 'bg-secondary/10 text-secondary';
                statusText = 'Shortlisted';
            } else if (app.status === 'pending' || app.status === 'submitted') {
                badgeClass = 'bg-tertiary-container/20 text-tertiary';
                statusText = 'Pending';
            }

            tr.innerHTML = `
                <td class="px-10 py-6">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">${initials}</div>
                        <span class="font-bold text-on-surface">${app.company}</span>
                    </div>
                </td>
                <td class="px-6 py-6 text-on-surface-variant font-label-md">${app.role}</td>
                <td class="px-6 py-6 text-on-surface-variant font-label-md">${app.drive_date || 'N/A'}</td>
                <td class="px-6 py-6">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 ${badgeClass} rounded-full font-bold text-[10px]">
                        <span class="w-1.5 h-1.5 rounded-full ${app.status === 'approved' || app.status === 'Selected' || app.status === 'Shortlisted' ? 'bg-secondary' : 'bg-tertiary'}"></span>
                        ${statusText}
                    </span>
                </td>
                <td class="px-10 py-6 text-right">
                    <button class="text-primary font-bold text-label-md opacity-0 group-hover:opacity-100 transition-opacity">View Details</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Render drives to grid
    function renderDrives(drives, appliedDriveIds) {
        const grid = document.querySelector('.grid.md\\:grid-cols-3');
        if (!grid) return;
        grid.innerHTML = '';

        if (drives.length === 0) {
            grid.innerHTML = `
                <div class="col-span-3 py-10 text-center text-on-surface-variant opacity-60">
                    No active recruitment drives at this time.
                </div>
            `;
            return;
        }

        // Show up to 3 drives on the main dashboard homepage
        drives.slice(0, 3).forEach(drive => {
            const card = document.createElement('div');
            card.className = 'group bg-surface-container-lowest border border-outline-variant rounded-2xl p-p-md shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-between';
            
            const initials = (drive.company || '').slice(0, 2).toUpperCase();
            const hasApplied = appliedDriveIds.has(drive.id);

            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-6">
                        <div class="w-14 h-14 bg-white rounded-xl border border-outline-variant flex items-center justify-center shadow-sm overflow-hidden">
                            <div class="font-bold text-primary text-xl">${initials}</div>
                        </div>
                        <span class="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wider">${drive.type || 'FTE'}</span>
                    </div>
                    <h4 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">${drive.company}</h4>
                    <p class="text-on-surface-variant font-label-md text-label-md mb-4">${drive.role}</p>
                    <div class="flex flex-wrap gap-2 mb-6">
                        <span class="px-3 py-1 bg-surface-container text-on-surface-variant text-caption rounded-lg flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">payments</span> ${drive.package || 'TBD'}
                        </span>
                        <span class="px-3 py-1 bg-surface-container text-on-surface-variant text-caption rounded-lg flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">calendar_today</span> ${drive.drive_date || 'TBD'}
                        </span>
                    </div>
                </div>
                ${hasApplied 
                    ? `<button class="w-full py-4 bg-surface-container text-on-surface-variant font-bold rounded-xl cursor-not-allowed" disabled>Applied</button>`
                    : `<button class="w-full py-4 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform apply-btn" data-drive-id="${drive.id}">Apply Now</button>`
                }
            `;
            grid.appendChild(card);
        });

        // Add application listener
        grid.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
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
                    
                    alert('Successfully applied for the drive!');
                    
                    // Reload data
                    location.reload();
                } catch (err) {
                    alert('Error: ' + err.message);
                    btn.disabled = false;
                    btn.textContent = 'Apply Now';
                }
            });
        });
    }

    // Update stats counters
    function updateStats(apps) {
        const submittedCount = apps.length;
        const shortlistedCount = apps.filter(a => a.status === 'approved' || a.status === 'Selected' || a.status === 'Shortlisted').length;
        const pendingCount = apps.filter(a => a.status === 'pending' || a.status === 'submitted').length;

        // Find standard counters by matching text label descriptions
        const statCards = document.querySelectorAll('section.bg-primary-container .glass-card');
        if (statCards.length >= 3) {
            statCards[0].querySelector('span.text-4xl').textContent = String(submittedCount).padStart(2, '0');
            statCards[1].querySelector('span.text-4xl').textContent = String(pendingCount).padStart(2, '0');
            statCards[2].querySelector('span.text-4xl').textContent = String(shortlistedCount).padStart(2, '0');
        }
    }
});