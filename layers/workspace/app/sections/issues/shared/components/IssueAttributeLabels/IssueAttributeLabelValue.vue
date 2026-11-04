<template>
  <span
    class="attribute-label"
    :style="{ '--attribute-color': color }"
    :title="title">
    {{ value }}
  </span>
</template>

<script setup lang="ts">
defineProps<{ color: string; title?: string; value: string }>()
</script>

<style scoped>
.attribute-label {
  background: color-mix(in srgb, var(--attribute-color) 14%, transparent);
  border-radius: var(--radius-small);
  color: color-mix(in srgb, var(--attribute-color) 55%, var(--color-text));
  display: block;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  max-width: 100%;
  overflow: hidden;
  padding: 0 var(--space-1);
  text-overflow: ellipsis;
  white-space: nowrap;
  width: fit-content;
}
</style>
