// Micro-interactions and Lightweight atmospheric effects
document.querySelectorAll('form input, form select').forEach(element => {
    element.addEventListener('focus', () => {
        element.parentElement.querySelector('label').classList.add('text-primary');
    });
    element.addEventListener('blur', () => {
        element.parentElement.querySelector('label').classList.remove('text-primary');
    });
});

// Dashboard Animation Trigger
window.addEventListener('load', () => {
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
});