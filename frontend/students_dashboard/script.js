// Micro-interactions and effects
document.addEventListener('DOMContentLoaded', () => {
    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('shadow-sm');
        } else {
            header.classList.remove('shadow-sm');
        }
    });

    // Card hover tilt effect (subtle)
    const cards = document.querySelectorAll('.group');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 50;
            const rotateY = (centerX - x) / 50;

            card.style.transform = `perspective(1000px) scale(1.01) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)';
        });
    });
});