<!-- A row of BaseMenu: a BaseButton menu row that Reka moves to with the arrow keys. `select` fires on
     a click or Enter; call preventDefault() on it to keep the menu open. -->
<template>
  <DropdownMenuItem
    as-child
    :disabled="disabled || loading"
    @select="emit('select', $event)">
    <BaseButton
      :loading="loading"
      menu
      :to="to"
      :variant="variant">
      <slot />
    </BaseButton>
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import { DropdownMenuItem } from 'reka-ui'
import type { RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    to?: RouteLocationRaw
    variant?: 'danger' | 'neutral'
  }>(),
  { disabled: false, loading: false, to: undefined, variant: 'neutral' },
)

const emit = defineEmits<{ select: [event: Event] }>()
</script>
