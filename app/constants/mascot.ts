/**
 * Boardy: the onboarding mascot. Plain markup so it can be dropped both into a
 * Vue template and into a driver.js popover, which only accepts an HTML string.
 */
export const mascotSvg = `<svg class="mascot" viewBox="0 0 64 64" role="img" aria-label="Boardy, your guide" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="4" width="4" height="8" rx="2" fill="var(--color-accent)" />
  <circle cx="32" cy="5" r="4" fill="var(--color-accent)" />
  <rect x="8" y="12" width="48" height="40" rx="14" fill="var(--color-accent)" />
  <rect x="16" y="22" width="32" height="18" rx="9" fill="var(--color-surface)" />
  <circle cx="26" cy="30" r="3.5" fill="var(--color-accent)" />
  <circle cx="38" cy="30" r="3.5" fill="var(--color-accent)" />
  <path d="M26 44h12" stroke="var(--color-surface)" stroke-width="3" stroke-linecap="round" />
  <rect x="2" y="28" width="6" height="14" rx="3" fill="var(--color-accent)" opacity="0.55" />
  <rect x="56" y="28" width="6" height="14" rx="3" fill="var(--color-accent)" opacity="0.55" />
</svg>`
