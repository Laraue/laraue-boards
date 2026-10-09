<!-- A square BaseButton for an icon (or a short text, like the language), with a required name. -->
<template>
  <BaseButton
    v-bind="$attrs"
    :aria-label="label"
    :disabled="disabled"
    icon
    :loading="loading"
    :to="to"
    :tooltip="tooltip ?? label"
    :type="type"
    :variant="variant">
    <slot />
  </BaseButton>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

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
    variant?: 'danger' | 'ghost' | 'primary'
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

defineOptions({ inheritAttrs: false })
</script>
