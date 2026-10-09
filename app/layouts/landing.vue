<template>
  <div class="landing-root">
    <slot />
  </div>
</template>

<!-- Global on purpose: the landing shares the app's tokens (colors, Geist, theme) and only adds a
     reset and a few aliases, all fenced under `.landing-root` so the app is
     not affected. -->
<style>
.landing-root {
  --landing-cta-bg: var(--color-action);
  --landing-cta-border: transparent;

  background: var(--color-background);
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.6;
  overflow-x: clip;
}

:root[data-theme='dark'] .landing-root {
  --landing-cta-bg: color-mix(in srgb, var(--color-action) 38%, var(--color-background));
  --landing-cta-border: var(--color-divider);
}

.landing-root :where(*, *::before, *::after) {
  margin: 0;
  padding: 0;
}

.landing-root :where(h1, h2, h3) {
  font-size: inherit;
  letter-spacing: normal;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}

.landing-root :where(ul) {
  list-style: none;
}

.landing-root :where(strong) {
  font-weight: 700;
}
</style>
