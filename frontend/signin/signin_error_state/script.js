// Simple input focus behavior for visual polish
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        // When focused, we could potentially clear the error state if we wanted
        // For this validation state display, we keep them red as requested
    });
});