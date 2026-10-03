<!-- The frame of the pages outside an organization: a header with the brand, and the page below. -->
<template>
  <div class="standalone-shell">
    <header class="app-header">
      <NuxtLink
        class="logo"
        :to="homePath">
        <img
          alt=""
          class="logo-mark"
          :src="laraueLogoUrl" />
        <span>Laraue Boards</span>
      </NuxtLink>
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
defineProps<{ homePath: string }>()
</script>

<style scoped>
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
