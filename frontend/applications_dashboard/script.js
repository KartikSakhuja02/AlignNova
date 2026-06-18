// Applications Dashboard Integration Logic

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

    // Micro-interaction for a subtle glow following the cursor
    document.addEventListener('mousemove', (e) => {
        const glow = document.getElementById('glow-cursor');
        if (glow) {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
            glow.style.opacity = '1';
        }
    });

    // Hover effect for table rows
    function setupRowInteractions() {
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.transform = 'translateX(4px)';
                row.style.transition = 'transform 0.2s ease';
            });
            row.addEventListener('mouseleave', () => {
                row.style.transform = 'translateX(0)';
            });
        });
    }

    try {
        // 2. Fetch and Render Applications
        const res = await fetch('/api/applications', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('Failed to fetch applications');
        const apps = await res.json();
        
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (apps.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-p-md py-8 text-center text-on-surface-variant font-body-md opacity-60">
                        No applications submitted yet.
                    </td>
                </tr>
            `;
            // Update counter
            const counter = document.querySelector('main span.font-caption');
            if (counter) counter.textContent = 'Showing 0 applications';
            return;
        }

        // Update total counter
        const counter = document.querySelector('main span.font-caption');
        if (counter) counter.textContent = `Showing ${apps.length} of ${apps.length} applications`;

        // Update statistics cards
        const statsApplied = document.querySelector('section.grid .text-display-lg');
        if (statsApplied) {
            statsApplied.textContent = String(apps.length);
            
            const statsPending = document.querySelectorAll('section.grid .text-display-lg')[1];
            if (statsPending) {
                const pendingCount = apps.filter(a => a.status === 'pending' || a.status === 'submitted').length;
                statsPending.textContent = String(pendingCount);
            }

            const statsOffers = document.querySelectorAll('section.grid .text-display-lg')[2];
            if (statsOffers) {
                const offersCount = apps.filter(a => a.status === 'approved' || a.status === 'Selected' || a.status === 'Shortlisted').length;
                statsOffers.textContent = String(offersCount);
            }
        }

        apps.forEach(a => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-surface-container-low/20 transition-colors group';

            const initials = (a.company || 'DR').slice(0, 2).toUpperCase();
            const appliedDate = a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A';

            let badgeClass = 'bg-primary/10 text-primary';
            let statusText = a.status;
            if (a.status === 'approved' || a.status === 'Selected' || a.status === 'Shortlisted') {
                badgeClass = 'bg-secondary/10 text-secondary';
                statusText = 'Shortlisted';
            } else if (a.status === 'pending' || a.status === 'submitted') {
                badgeClass = 'bg-tertiary-container/20 text-tertiary';
                statusText = 'Pending';
            }

            tr.innerHTML = `
                <td class="px-p-md py-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary">${initials}</div>
                        <span class="font-body-md text-on-surface font-semibold">${a.company}</span>
                    </div>
                </td>
                <td class="px-p-md py-6 font-body-md text-on-surface-variant">${a.role}</td>
                <td class="px-p-md py-6 font-body-md text-on-surface-variant">${a.drive_date || appliedDate}</td>
                <td class="px-p-md py-6">
                    <span class="px-3 py-1.5 rounded-full ${badgeClass} font-label-md text-[12px] uppercase">${statusText}</span>
                </td>
                <td class="px-p-md py-6 text-right">
                    <div class="flex justify-end gap-3">
                        <button class="text-primary font-label-md hover:underline">View Details</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        setupRowInteractions();

    } catch (err) {
        console.error('Error fetching applications:', err);
    }
});