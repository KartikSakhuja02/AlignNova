/* ============================================
   AlignNova - script.js
   UI micro-interactions and save handling
   ============================================ */

/**
 * Input / textarea focus ring enhancement.
 * Adds a highlighted border class to the parent card
 * when any form field is focused.
 */
document.querySelectorAll('input, textarea').forEach(input => {
  input.addEventListener('focus', function () {
    this.parentElement.parentElement.classList.add('border-primary/40');
  });

  input.addEventListener('blur', function () {
    this.parentElement.parentElement.classList.remove('border-primary/40');
  });
});

/**
 * Save button click handler.
 * Appends an animated check icon to the button,
 * then shows a success confirmation after a short delay.
 */
document.querySelectorAll('button').forEach(btn => {
  if (btn.textContent.trim().startsWith('Save')) {
    btn.addEventListener('click', () => {
      // Prevent stacking icons on repeated clicks
      if (btn.querySelector('.save-icon')) return;

      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined ml-2 animate-bounce save-icon';
      icon.innerText = 'check_circle';
      btn.appendChild(icon);

      setTimeout(() => {
        icon.remove();
        alert('Profile updated successfully!');
      }, 1000);
    });
  }
});