// =====================================================
//  AlignNova Profile — Interactions
// =====================================================

// Sticky header shadow on scroll
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 20) {
    header.classList.add('shadow-sm');
  } else {
    header.classList.remove('shadow-sm');
  }
});