<template>
  <input
    v-model="model"
    class="base-input"
    :class="{ 'base-input-inline': variant === 'inline' }"
    :disabled="disabled" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ disabled?: boolean; variant?: 'default' | 'inline' }>(), {
  disabled: false,
  variant: 'default',
})
const model = defineModel<string>({ required: true })
</script>

<style scoped>
.base-input {
  min-width: 0;
  transition: border-color var(--duration-fast) var(--ease-standard);
}

.base-input-inline {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}

/* Borderless reads as plain text; the border on hover shows it can be edited. */
.base-input-inline:hover:not(:disabled, :focus) {
  border-color: var(--color-border-hover);
}

.base-input-inline:focus {
  border-color: var(--color-focus);
}
</style>
