// Micro-interaction for a subtle glow following the cursor on high-end monitors
document.addEventListener('mousemove', (e) => {
    const glow = document.getElementById('glow-cursor');
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.style.opacity = '1';
});

// Tab selection visual logic (simplified for prototype)
const navLinks = document.querySelectorAll('aside nav a');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.innerText.trim() !== 'Applications') {
            // Prevent navigation in demo but show click feedback
            link.classList.add('scale-95');
            setTimeout(() => link.classList.remove('scale-95'), 100);
        }
    });
});

// Hover effect for table rows
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