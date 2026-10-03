<template>
  <!-- Each button has its own provider so it works anywhere, a test mount included. -->
  <TooltipProvider :delay-duration="600">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <NuxtLink
          v-if="to"
          v-bind="$attrs"
          :aria-label="label"
          class="icon-button"
          :class="variant"
          :to="to">
          <slot />
        </NuxtLink>
        <button
          v-else
          v-bind="$attrs"
          :aria-busy="loading || undefined"
          :aria-label="label"
          class="icon-button"
          :class="variant"
          :disabled="disabled || loading"
          :type="type">
          <IconLoader2
            v-if="loading"
            class="icon-button-spinner" />
          <slot v-else />
        </button>
      </TooltipTrigger>
      <!-- Not portaled: a popup outside an open <dialog> would be under it and inert. -->
      <TooltipContent
        class="icon-button-tooltip"
        side="bottom"
        :side-offset="4">
        {{ tooltip ?? label }}
      </TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { IconLoader2 } from '@tabler/icons-vue'
import { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from 'reka-ui'
import type { RouteLocationRaw } from 'vue-router'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    disabled?: boolean
    label: string
    loading?: boolean
    // Makes it a link.
    to?: RouteLocationRaw
    // A longer hint than the accessible name, e.g. with a shortcut.
    tooltip?: string
    type?: 'button' | 'submit'
    variant?: 'ghost' | 'primary'
  }>(),
  {
    disabled: false,
    loading: false,
    to: undefined,
    tooltip: undefined,
    type: 'button',
    variant: 'ghost',
  },
)
</script>

<style scoped>
.icon-button {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: inline-flex;
  flex: none;
  /* For a short text instead of an icon, like the language. */
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  height: var(--icon-btn-size);
  justify-content: center;
  padding: 0;
  text-decoration: none;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
  width: var(--icon-btn-size);
}

.icon-button.primary {
  background: var(--color-action);
  border-color: var(--color-action);
  color: #fff;
}

.icon-button:focus-visible {
  border-color: var(--color-focus);
  box-shadow: none;
}

.icon-button.primary:focus-visible {
  box-shadow: inset 0 0 0 1px var(--color-surface);
}

.icon-button-spinner {
  animation: var(--animation-spin);
}

@media (hover: hover) and (pointer: fine) {
  .icon-button:hover:not(:disabled) {
    background: var(--color-hover);
    color: var(--color-text);
  }

  .icon-button.primary:hover:not(:disabled) {
    background: var(--color-action-hover);
    color: #fff;
  }
}
</style>

<style>
/* Unscoped: the content is rendered by Reka, outside this component's root. */
.icon-button-tooltip {
  background: var(--color-tooltip);
  border-radius: var(--radius-small);
  color: var(--color-tooltip-text);
  font-size: var(--font-size-small);
  max-width: 240px;
  padding: var(--space-1) var(--space-2);
  z-index: 60;
}
</style>
