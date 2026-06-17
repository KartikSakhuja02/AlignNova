/* =============================================
   AlignNova — Main JavaScript
   ============================================= */

/**
 * Toggle dark mode on the root element.
 * Can be wired up to a button or keyboard shortcut.
 */
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
}

/**
 * Simulate profile data loading.
 * In production, replace this with a real fetch call,
 * then swap the skeleton placeholders for real content.
 */
function loadProfile() {
  console.log("Fetching profile data…");

  // Example: replace with your real API call
  // fetch("/api/profile")
  //   .then(res => res.json())
  //   .then(data => renderProfile(data))
  //   .catch(err => console.error("Profile load failed:", err));
}

window.addEventListener("load", loadProfile);