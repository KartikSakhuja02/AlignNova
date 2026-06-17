// Subtle interactivity for the empty state
document.addEventListener('DOMContentLoaded', () => {
  const emptyStateCard = document.querySelector('.bg-surface-container-lowest.min-h-\\[500px\\]');

  emptyStateCard.addEventListener('mousemove', (e) => {
    const rect = emptyStateCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Move the subtle background glow based on mouse
    const glow = emptyStateCard.querySelector('.animate-pulse');
    if (glow) {
      glow.style.transform = `translate(${(x - rect.width / 2) / 20}px, ${(y - rect.height / 2) / 20}px)`;
    }
  });

  // Simple refresh animation for the secondary button
  const refreshBtn = document.querySelector('button:contains("Refresh")');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      const icon = this.querySelector('.material-symbols-outlined');
      this.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">refresh</span> Checking...';
      setTimeout(() => {
        this.innerHTML = 'Refresh Timeline';
      }, 1500);
    });
  }
});

// Custom helper for contains (since native selector doesn't support it)
window.addEventListener('load', () => {
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    if (btn.textContent.includes('Refresh')) {
      btn.onclick = () => {
        btn.classList.add('opacity-50', 'pointer-events-none');
        const originalText = btn.textContent;
        btn.textContent = 'Checking for updates...';
        setTimeout(() => {
          btn.classList.remove('opacity-50', 'pointer-events-none');
          btn.textContent = originalText;
        }, 1000);
      }
    }
  });
});