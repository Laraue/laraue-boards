<!-- A short label or count in a pill: a status, a number of items, a "beta" mark. One size; the
     variant says what it means. -->
<template>
  <span
    class="base-badge"
    :class="variant">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    // neutral for counts and plain states, outline for a quiet mark next to a name, the colors
    // for states that mean something: accent (current, in progress), success, warning, danger.
    variant?: 'accent' | 'danger' | 'neutral' | 'outline' | 'success' | 'warning'
  }>(),
  { variant: 'neutral' },
)
</script>

<style scoped>
.base-badge {
  align-items: center;
  background: var(--color-soft);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  color: var(--color-muted);
  display: inline-flex;
  flex: none;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  height: 1.25rem;
  justify-content: center;
  line-height: 1;
  min-width: 1.25rem;
  padding: 0 var(--space-2);
  white-space: nowrap;
}

.base-badge.accent {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.base-badge.success {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.base-badge.warning {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.base-badge.danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.base-badge.outline {
  background: transparent;
  border-color: currentcolor;
}
</style>
