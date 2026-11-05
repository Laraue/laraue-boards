<template>
  <input
    v-bind="$attrs"
    class="base-input"
    :class="{ 'base-input-inline': variant === 'inline' }"
    :disabled="disabled"
    :value="model"
    @compositionend="update"
    @input="update" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ disabled?: boolean; variant?: 'default' | 'inline' }>(), {
  disabled: false,
  variant: 'default',
})

// Native input validators run before this component reads the resulting value.
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })

const update = (event: Event) => {
  if (event instanceof InputEvent && event.isComposing) {
    return
  }
  model.value = (event.target as HTMLInputElement).value
}
</script>

<style scoped>
:where(.base-input) {
  min-width: 0;
  padding: 0 var(--space-2);
  transition: border-color var(--duration-fast) var(--ease-standard);
}

/* Content-width like the inline select, so a short value isn't a long empty field. */
.base-input-inline {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  field-sizing: content;
  justify-self: start;
  max-width: 100%;
  min-width: calc(var(--space-8) * 2);
  width: auto;
}

/* Borderless reads as plain text; the border on hover shows it can be edited. */
.base-input-inline:hover:not(:disabled, :focus) {
  border-color: var(--color-border-hover);
}

.base-input-inline:focus {
  border-color: var(--color-focus);
}
</style>
