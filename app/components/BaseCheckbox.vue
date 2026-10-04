<template>
  <label class="base-checkbox">
    <input
      v-model="model"
      :disabled="disabled"
      type="checkbox" />
    <span><slot /></span>
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

const model = defineModel<boolean>({ required: true })
</script>

<style scoped>
.base-checkbox {
  align-items: center;
  border-radius: var(--radius-control);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  font-size: var(--font-size-body);
  font-weight: 400;
  gap: var(--space-2);
  margin: 0;
  min-height: var(--control-height);
  padding: var(--space-1) var(--space-2);
}

.base-checkbox:has(input:disabled) {
  cursor: not-allowed;
}

@media (hover: hover) and (pointer: fine) {
  .base-checkbox:hover:not(:has(input:disabled)) {
    background: var(--color-hover);
  }
}
</style>
