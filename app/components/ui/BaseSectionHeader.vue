<!-- The heading of a page section: its title, an optional line under it and the section's actions on
     the right. The `leading` slot goes before the title, such as a link back to the list above. -->
<template>
  <header class="base-section-header">
    <div
      v-if="$slots.leading"
      class="base-section-header-leading">
      <slot name="leading" />
    </div>
    <div class="base-section-header-text">
      <h2 :id="id">{{ title }}</h2>
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
// id: for a section that names itself after this heading through aria-labelledby.
defineProps<{ description?: string; id?: string; title: string }>()
</script>

<style scoped>
.base-section-header {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  min-height: var(--control-height);
}

.base-section-header-leading {
  display: flex;
  flex: none;
  margin-right: calc(var(--space-4) * -1 + var(--space-2));
}

.base-section-header-text {
  display: grid;
  flex: 1;
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
