<template>
  <BaseTooltip
    v-if="tooltip"
    :text="tooltip">
    <component
      :is="tag"
      v-bind="{ ...$attrs, ...tagAttrs }"
      :class="classes">
      <IconLoader2
        v-if="loading"
        class="base-button-spinner" />
      <slot v-if="!loading || !icon" />
      <span
        v-if="$slots.label"
        class="base-button-label">
        <slot name="label" />
      </span>
    </component>
  </BaseTooltip>
  <!-- Without a tooltip the button is the root, so a parent's scoped class still styles it. -->
  <component
    :is="tag"
    v-else
    v-bind="{ ...$attrs, ...tagAttrs }"
    :class="classes">
    <IconLoader2
      v-if="loading"
      class="base-button-spinner" />
    <slot v-if="!loading || !icon" />
    <span
      v-if="$slots.label"
      class="base-button-label">
      <slot name="label" />
    </span>
  </component>
</template>

<script setup lang="ts">
import { IconLoader2 } from '@tabler/icons-vue'
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    // A square button for an icon; IconButton gives it an accessible name.
    icon?: boolean
    iconOnMobile?: boolean
    loading?: boolean
    menu?: boolean
    // Small for secondary actions inside content; default for the main actions of a page.
    size?: 'default' | 'small'
    // Makes the control a navigation link.
    to?: RouteLocationRaw
    // A hint on hover, in the same tooltip as the icon buttons'.
    tooltip?: string
    type?: 'button' | 'submit'
    variant?: 'danger' | 'ghost' | 'neutral' | 'primary'
  }>(),
  {
    disabled: false,
    icon: false,
    iconOnMobile: false,
    loading: false,
    menu: false,
    size: 'default',
    to: undefined,
    tooltip: undefined,
    type: 'button',
    variant: 'neutral',
  },
)

defineOptions({ inheritAttrs: false })

const NuxtLink = resolveComponent('NuxtLink')
const tag = computed(() => (props.to ? NuxtLink : 'button'))
const tagAttrs = computed(() =>
  props.to
    ? { to: props.to }
    : {
        'aria-busy': props.loading || undefined,
        disabled: props.disabled || props.loading,
        type: props.type,
      },
)
const classes = computed(() => [
  'base-button',
  props.variant,
  props.size,
  { icon: props.icon, 'icon-on-mobile': props.iconOnMobile, menu: props.menu },
])
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
  text-decoration: none;
  transition: border-color var(--duration-fast) var(--ease-standard);
  white-space: nowrap;
}

/* Bordered buttons sit slightly above the surface. */
.base-button.neutral:not(.menu),
.base-button.danger:not(.menu, .icon) {
  box-shadow: var(--shadow-control);
}

/* Sized by --icon-btn-size, which a parent may set to fit a dense spot. */
.base-button.icon {
  height: var(--icon-btn-size);
  padding: 0;
  width: var(--icon-btn-size);
}

/* Muted at rest, so a list of rows isn't a column of red; red once aimed at. */
.base-button.icon.danger {
  background: transparent;
  border-color: transparent;
  color: var(--color-muted);
}

.base-button.icon.danger:focus-visible {
  border-color: var(--color-focus);
  color: var(--color-danger);
}

.base-button.small {
  height: var(--control-height-small);
  padding: 0 var(--space-2);
}

.base-button.primary {
  background: var(--color-action);
  border-color: var(--color-action);
  color: var(--color-on-action);
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
  font-weight: 400;
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

@media (max-width: 767px) {
  .base-button.icon-on-mobile {
    padding: 0;
    width: var(--control-height);
  }

  .base-button.icon-on-mobile .base-button-label {
    display: none;
  }
}

@media (hover: hover) and (pointer: fine) {
  .base-button:hover:not(:disabled) {
    border-color: var(--color-border-hover);
  }

  .base-button.primary:hover:not(:disabled) {
    border-color: var(--color-action-hover);
  }

  .base-button.danger:hover:not(:disabled) {
    border-color: var(--color-danger);
  }

  /* Borderless buttons show hover as a soft fill, like menu rows. */
  .base-button.ghost:hover:not(:disabled) {
    background: var(--color-soft);
    border-color: transparent;
  }

  .base-button.icon.danger:hover:not(:disabled) {
    background: var(--color-danger-soft);
    border-color: transparent;
    color: var(--color-danger);
  }

  .base-button.menu:hover:not(:disabled) {
    background: var(--color-soft);
    border-color: transparent;
  }

  .base-button.menu[data-active='true']:hover:not(:disabled) {
    background: var(--color-accent-soft);
  }
}
</style>
