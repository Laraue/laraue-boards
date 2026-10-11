<!-- A settings page: a menu of its sections on the left and the current section beside it, no wider
     than a form reads well. On narrow screens the menu runs across the top. -->
<template>
  <div class="base-settings-layout">
    <BaseNavTabs
      class="base-settings-nav"
      :items="items"
      :label="label"
      vertical />
    <div class="base-settings-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NavTab } from './BaseNavTabs.types'

defineProps<{ items: NavTab[]; label: string }>()
</script>

<style scoped>
.base-settings-layout {
  align-items: start;
  display: grid;
  gap: var(--space-8);
  grid-template-columns: 12rem minmax(0, 48rem);
}

.base-settings-content {
  display: grid;
  gap: var(--space-5);
  min-width: 0;
}

@media (max-width: 767px) {
  .base-settings-layout {
    gap: var(--space-5);
    grid-template-columns: minmax(0, 1fr);
  }

  .base-settings-nav {
    flex-direction: row;
    overflow-x: auto;
    scrollbar-width: none;
  }
}
</style>
