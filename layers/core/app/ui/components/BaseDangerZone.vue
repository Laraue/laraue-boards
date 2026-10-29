<!-- The destructive action of a settings page, apart from its form: a line above it, what the action
     does, and its button in the default slot. -->
<template>
  <section class="base-danger-zone">
    <div class="base-danger-zone-text">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{ description: string; title: string }>()
</script>

<style scoped>
.base-danger-zone {
  align-items: center;
  border-top: 1px solid var(--color-divider);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
  justify-content: space-between;
  padding-top: var(--space-5);
}

.base-danger-zone-text {
  display: grid;
  flex: 1 1 16rem;
  gap: var(--space-1);
}

h3 {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  margin: 0;
}

p {
  color: var(--color-muted);
  margin: 0;
}
</style>
