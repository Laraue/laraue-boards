<template>
  <div class="landing-root">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#app'
import { previewImageUrl } from '#layers/core/app/constants/links'
import { useLocale } from '#layers/core/app/i18n/useI18n'

const locale = useLocale()

// What every public page shares: it is indexed, it can be zoomed (the app's own viewport forbids it,
// so iOS does not zoom into focused inputs), and its preview image is the one of its language.
useSeoMeta({
  ogImage: () => previewImageUrl[locale.value],
  ogImageHeight: 630,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  robots: 'index, follow, max-image-preview:large',
  viewport: 'width=device-width, initial-scale=1',
})
</script>

<!-- Global on purpose: the landing shares the app's tokens (colors, Geist, theme) and only adds a
     reset and a few aliases, all fenced under `.landing-root` so the app is
     not affected. -->
<style>
/* Reserve the scrollbar's place on pages that scroll as a whole. */
html:has(.landing-root) {
  scrollbar-gutter: stable;
}

/* The gutter already reserves the space that Reka's scroll lock adds as body padding. */
html:has(.landing-root) body {
  padding-right: 0 !important;
}

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

/* Zero specificity, so any component's class (a tooltip's padding, say) beats the reset. */
:where(.landing-root *),
:where(.landing-root *)::before,
:where(.landing-root *)::after {
  margin: 0;
  padding: 0;
}

.landing-root :where(h1) {
  min-width: 0;
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

/* Text links get the app's focus line inside them instead of the browser's outer outline. */
.landing-root :where(a:focus-visible) {
  border-radius: var(--radius-small);
  box-shadow: var(--shadow-focus);
  outline: none;
}

/* Anchored sections (#features, #pricing, #faq) stop below the sticky header, not under it. */
.landing-root :where([id]) {
  scroll-margin-top: 72px;
}

@media (prefers-reduced-motion: no-preference) {
  html:has(.landing-root) {
    scroll-behavior: smooth;
  }
}
</style>
