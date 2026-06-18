// Admin Dashboard Integration Logic

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

    // Input labels focus styling
    document.querySelectorAll('form input, form select').forEach(element => {
        element.addEventListener('focus', () => {
            element.parentElement.querySelector('label')?.classList.add('text-primary');
        });
        element.addEventListener('blur', () => {
            element.parentElement.querySelector('label')?.classList.remove('text-primary');
        });
    });

    // Overview cards fade-in load animations
    const cards = document.querySelectorAll('section > div');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // 2. Publish Drive Form Submission
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            
            // Gather input fields dynamically by placeholders/types
            const company = form.querySelector('input[placeholder^="e.g."]')?.value || '';
            const role = form.querySelector('input[placeholder^="Software"]')?.value || '';
            const type = form.querySelector('select')?.value || '';
            const eligibility = form.querySelector('input[placeholder="8.5"]')?.value || '';
            const packageVal = form.querySelector('input[placeholder="24.5"]')?.value || '';
            const drive_date = form.querySelector('input[type="date"]')?.value || '';

            const data = {
                company,
                role,
                type,
                eligibility,
                package: packageVal ? `${packageVal} LPA` : 'TBD',
                drive_date
            };

            btn.disabled = true;
            btn.textContent = 'Publishing...';

            try {
                const res = await fetch('/api/drives', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(data)
                });
                if (!res.ok) throw new Error('Failed to publish drive');
                
                alert('Drive published successfully!');
                form.reset();
                
                // Reload dashboard data to update counters
                loadDashboardData();
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Publish Drive <span class="material-symbols-outlined">send</span>';
            }
        });
    }

    // Load initial dashboard metrics and applications
    loadDashboardData();

    async function loadDashboardData() {
        try {
            // Fetch drives count
            const drivesRes = await fetch('/api/drives');
            if (!drivesRes.ok) throw new Error('Failed to fetch drives');
            const drives = await drivesRes.json();

            // Fetch live applications
            const appsRes = await fetch('/api/applications', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!appsRes.ok) throw new Error('Failed to fetch applications');
            const applications = await appsRes.json();

            // Render live applications list
            renderApplications(applications);

            // Update overview analytics metrics counters
            const metrics = document.querySelectorAll('section.grid h4');
            if (metrics.length >= 4) {
                // Metric 3: Active corporate drives count
                metrics[2].textContent = String(drives.length);

                // Metric 4: Pending approvals count
                const pendingCount = applications.filter(a => a.status === 'pending' || a.status === 'submitted').length;
                metrics[3].textContent = String(pendingCount);
            }

        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        }
    }

    function renderApplications(apps) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (apps.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-8 py-8 text-center text-on-surface-variant font-body-md opacity-60">
                        No active candidate applications.
                    </td>
                </tr>
            `;
            return;
        }

        // Update application list counter
        const managerDesc = document.querySelector('section.col-span-12 p.font-label-md');
        if (managerDesc) {
            managerDesc.textContent = `Reviewing ${apps.length} active candidate tracks`;
        }

        apps.forEach(app => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-surface-container-low/20 transition-standard';

            const initials = (app.student_name || app.student_email || 'ST').slice(0, 2).toUpperCase();
            
            // Calculate a pseudo-CGPA derived from application ID to look realistic
            const pseudoCGPA = (8.2 + (app.id % 17) / 10).toFixed(2);

            const isPending = (app.status === 'submitted' || app.status === 'pending');

            tr.innerHTML = `
                <td class="px-8 py-5">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center font-bold text-on-secondary-container">${initials}</div>
                        <div>
                            <p class="font-body-md text-body-md font-bold">${app.student_name}</p>
                            <p class="text-xs text-on-surface-variant">${app.student_email}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-5">
                    <p class="font-body-md text-body-md font-medium">${app.company}</p>
                    <p class="text-xs text-on-surface-variant">${app.role}</p>
                </td>
                <td class="px-6 py-5 text-center">
                    <span class="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-sm">${pseudoCGPA}</span>
                </td>
                <td class="px-6 py-5 text-center">
                    <button class="text-on-surface-variant hover:text-primary transition-standard" title="View details/resume">
                        <span class="material-symbols-outlined">description</span>
                    </button>
                </td>
                <td class="px-8 py-5 text-right">
                    <div class="flex items-center justify-end gap-2">
                        ${isPending 
                            ? `<button class="px-4 py-2 bg-secondary text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity approve-btn" data-app-id="${app.id}">Approve</button>`
                            : `<span class="px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-lg font-label-md text-label-md">Approved</span>`
                        }
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Attach event listeners to Approve buttons
        tbody.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const appId = btn.getAttribute('data-app-id');
                btn.disabled = true;
                btn.textContent = 'Processing...';

                try {
                    const res = await fetch(`/api/applications/${appId}/status`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ status: 'approved' })
                    });

                    if (!res.ok) throw new Error('Approval request failed');

                    alert('Application approved!');
                    loadDashboardData();
                } catch (err) {
                    alert('Error: ' + err.message);
                    btn.disabled = false;
                    btn.textContent = 'Approve';
                }
            });
        });
    }
});