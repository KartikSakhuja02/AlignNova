// Atmospheric Micro-interaction for background
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    // Subtle shift of the container based on mouse position
    const container = document.querySelector('main');
    const moveX = (x - 0.5) * 10;
    const moveY = (y - 0.5) * 10;

    container.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// Auto-refresh simulation (Optional for visual proof of loading state)
// In a real app, this would be tied to the API response
setTimeout(() => {
    console.log('Authentication service responding...');
}, 3000);