<!-- The frame of the pages outside an organization: a header with the brand, and the page below. -->
<template>
  <div class="standalone-shell">
    <header class="app-header">
      <BrandLogo :to="homePath" />
      <div class="app-header-actions">
        <AppHeaderPreferences />
        <slot name="actions" />
      </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#app'
import BrandLogo from '#layers/core/app/branding/BrandLogo.vue'

import AppHeaderPreferences from './components/AppHeaderPreferences.vue'

defineProps<{ homePath: string }>()

// The app's pages are private. The server already sends X-Robots-Tag (see the layer's
// nuxt.config); the tag repeats it in the page for crawlers and tools that read only the HTML.
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<style scoped>
.app-header {
  align-items: center;
  backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--color-surface) 85%, transparent);
  border-bottom: 1px solid var(--color-divider);
  /* 55px plus the border, like SiteHeader: on a scaled screen the border is less than 1px, and
     the logo has to land on the same spot in both. */
  box-sizing: content-box;
  display: flex;
  gap: var(--space-3);
  height: 55px;
  justify-content: space-between;
  padding: 0 var(--space-6);
  position: sticky;
  top: 0;
  z-index: 20;
}

.app-header-actions {
  align-items: center;
  display: flex;
  gap: var(--space-1);
}

@media (max-width: 767px) {
  .app-header {
    padding: 0 var(--space-4);
  }
}

.standalone-shell {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100dvh;
}

main {
  min-width: 0;
}

/* The site's width (see SiteHeader), so the brand stays put between the landing page and sign-in. */
@media (min-width: 768px) {
  .app-header {
    padding-inline: max(var(--space-6), (100% - 1360px) / 2 + var(--space-6));
  }
}
</style>

<style>
/* Reserve the scrollbar's place on pages that scroll as a whole. */
html:has(.standalone-shell) {
  scrollbar-gutter: stable;
}

/* The gutter already reserves the space that Reka's scroll lock adds as body padding. */
html:has(.standalone-shell) body {
  padding-right: 0 !important;
}
</style>
