<!-- Stacks BaseFields with one gap. `horizontal` puts each label beside its control, the labels in one
     column as wide as the longest. -->
<template>
  <div
    class="base-field-group"
    :class="{ horizontal }">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ horizontal?: boolean }>(), { horizontal: false })
</script>

<style>
/* Unscoped: it lays out the BaseFields passed in, down to their labels. */
.base-field-group {
  display: grid;
  gap: var(--space-5);
  min-width: 0;
}

.base-field-group.horizontal {
  align-items: center;
  column-gap: var(--space-4);
  grid-template-columns: max-content minmax(0, 1fr);
  row-gap: var(--space-3);
}

.base-field-group.horizontal > .base-field {
  column-gap: var(--space-4);
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
}

/* The label sits on the control's line, not on the hint under it. */
.base-field-group.horizontal > .base-field > .base-field-label {
  align-self: start;
  line-height: var(--control-height);
}
</style>
