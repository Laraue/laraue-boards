<template>
  <span
    class="attribute-label"
    :style="{ '--attribute-color': color }"
    :title="title">
    <AttributeIcon aria-hidden="true" />
    <span class="attribute-label-text">{{ value }}</span>
  </span>
</template>

<script setup lang="ts">
import { AttributeIcon } from '#layers/workspace/app/shared/constants/icons'

defineProps<{ color: string; title?: string; value: string }>()
</script>

<style scoped>
.attribute-label {
  align-items: center;
  background: color-mix(in srgb, var(--attribute-color) 8%, transparent);
  border-radius: var(--radius-small);
  color: color-mix(in srgb, var(--attribute-color) 25%, var(--color-muted));
  display: flex;
  font-size: var(--font-size-sm);
  gap: var(--space-1);
  line-height: 1.5;
  max-width: 100%;
  overflow: hidden;
  padding: 0 var(--space-1);
  white-space: nowrap;
  width: fit-content;
}

.attribute-label .tabler-icon {
  color: var(--attribute-color);
  flex: none;
  height: var(--font-size-small);
  width: var(--font-size-small);
}

.attribute-label-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
