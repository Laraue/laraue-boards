<!-- A settings page: a menu of its sections on the left and the current section beside it, no wider
     than a form reads well. The `aside` slot is a short note under the menu. On narrow screens the
     menu runs across the top. -->
<template>
  <div class="base-settings-layout">
    <div class="base-settings-aside">
      <BaseNavTabs
        class="base-settings-nav"
        :items="items"
        :label="label"
        vertical />
      <p
        v-if="$slots.aside"
        class="base-settings-note">
        <slot name="aside" />
      </p>
    </div>
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

.base-settings-aside {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}

.base-settings-note {
  color: var(--color-muted);
  font-size: var(--font-size-sm);
  margin: 0;
  padding: 0 var(--space-3);
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
