<template>
  <!-- Without a tooltip the button is the root, so a parent's scoped class still styles it. -->
  <BaseTooltip
    v-if="tooltip"
    :text="tooltip">
    <button
      v-bind="$attrs"
      :aria-busy="loading || undefined"
      class="base-button"
      :class="[variant, size, { menu }]"
      :disabled="disabled || loading"
      :type="type">
      <IconLoader2
        v-if="loading"
        class="base-button-spinner" />
      <slot />
    </button>
  </BaseTooltip>
  <button
    v-else
    v-bind="$attrs"
    :aria-busy="loading || undefined"
    class="base-button"
    :class="[variant, size, { menu }]"
    :disabled="disabled || loading"
    :type="type">
    <IconLoader2
      v-if="loading"
      class="base-button-spinner" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { IconLoader2 } from '@tabler/icons-vue'

withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    menu?: boolean
    // Small for secondary actions inside content; default for the main actions of a page.
    size?: 'default' | 'small'
    // A hint on hover, in the same tooltip as the icon buttons'.
    tooltip?: string
    type?: 'button' | 'submit'
    variant?: 'danger' | 'ghost' | 'neutral' | 'primary'
  }>(),
  {
    disabled: false,
    loading: false,
    menu: false,
    size: 'default',
    tooltip: undefined,
    type: 'button',
    variant: 'neutral',
  },
)

defineOptions({ inheritAttrs: false })
</script>

<style scoped>
.base-button {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: inline-flex;
  flex: none;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
  height: var(--control-height);
  justify-content: center;
  max-width: 100%;
  padding: 0 var(--space-3);
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
  white-space: nowrap;
}

.base-button.small {
  height: var(--control-height-small);
  padding: 0 var(--space-2);
}

.base-button.primary {
  background: var(--color-action);
  border-color: var(--color-action);
  color: #fff;
}

.base-button.ghost {
  background: transparent;
  border-color: transparent;
  color: var(--color-muted);
}

.base-button.danger {
  color: var(--color-danger);
}

.base-button.menu {
  background: transparent;
  border-color: transparent;
  flex: 1 1 auto;
  height: var(--control-height);
  justify-content: flex-start;
  min-width: 0;
  text-align: left;
  width: 100%;
}

.base-button.menu[data-active='true'] {
  background: var(--color-accent-soft);
}

.base-button:focus-visible {
  border-color: var(--color-focus);
  box-shadow: none;
}

.base-button.primary:focus-visible {
  box-shadow: inset 0 0 0 1px var(--color-surface);
}

.base-button-spinner {
  animation: var(--animation-spin);
}

@media (hover: hover) and (pointer: fine) {
  .base-button:hover:not(:disabled) {
    background: var(--color-hover);
  }

  .base-button.primary:hover:not(:disabled) {
    background: var(--color-action-hover);
  }

  .base-button.ghost:hover:not(:disabled) {
    color: var(--color-text);
  }

  .base-button.danger:hover:not(:disabled) {
    background: var(--color-danger-soft);
  }
}
</style>
