<!-- The heading of a page section: its title, an optional line under it and the section's actions on
     the right. -->
<template>
  <header class="base-section-header">
    <div class="base-section-header-text">
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <div
      v-if="$slots.actions"
      class="base-section-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ description?: string; title: string }>()
</script>

<style scoped>
.base-section-header {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  min-height: var(--control-height);
}

.base-section-header-text {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-heading);
  margin: 0;
}

p {
  color: var(--color-muted);
  margin: 0;
}

.base-section-header-actions {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--space-2);
}
</style>
