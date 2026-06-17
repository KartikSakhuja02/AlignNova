// Form submission with loading/success micro-interaction
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const originalContent = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>Authenticating...</span>
  `;

  setTimeout(() => {
    btn.innerHTML = `
      <span class="material-symbols-outlined text-[20px]">check_circle</span>
      <span>Success</span>
    `;
    btn.classList.replace('bg-primary', 'bg-secondary');

    setTimeout(() => {
      alert('Redirecting to dashboard...');
      btn.disabled = false;
      btn.innerHTML = originalContent;
      btn.classList.replace('bg-secondary', 'bg-primary');
    }, 1000);
  }, 1500);
});

// Subtle parallax effect on background blobs
document.addEventListener('mousemove', (e) => {
  const moveX = (e.clientX - window.innerWidth / 2) / 50;
  const moveY = (e.clientY - window.innerHeight / 2) / 50;
  const blobs = document.querySelectorAll('.rounded-full');

  blobs.forEach((blob, index) => {
    const multiplier = index === 0 ? 1 : -1;
    blob.style.transform = `translate(${moveX * multiplier}px, ${moveY * multiplier}px)`;
  });
});