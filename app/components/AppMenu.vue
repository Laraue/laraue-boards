<!-- A menu of actions on Reka DropdownMenu: arrow keys move between items, Enter picks one, typing a
     letter jumps to it. Items are AppMenuItem; AppMenuSeparator splits groups. For a panel with
     fields or sections instead of actions, use AppPopover. -->
<template>
  <!-- The wrapper takes the consumer's class and listeners. -->
  <div class="app-menu-root">
    <DropdownMenuRoot
      v-model:open="open"
      :modal="false">
      <DropdownMenuTrigger as-child>
        <slot
          name="trigger"
          :open="open" />
      </DropdownMenuTrigger>
      <!-- Not portaled: outside an open <dialog> it would be under it and inert. -->
      <DropdownMenuContent
        :align="align"
        :aria-label="label"
        class="app-menu"
        :collision-padding="16"
        :side="side"
        :side-offset="8">
        <slot />
      </DropdownMenuContent>
    </DropdownMenuRoot>
  </div>
</template>

<script setup lang="ts">
import { DropdownMenuContent, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'

withDefaults(
  defineProps<{
    align?: 'end' | 'start'
    label?: string
    side?: 'bottom' | 'right'
  }>(),
  { align: 'start', label: undefined, side: 'bottom' },
)

const open = ref(false)
</script>

<style scoped>
.app-menu-root {
  width: fit-content;
}
</style>

<style>
/* Unscoped: Reka puts the class on its inner element. The same surface as AppPopover. */
.app-menu {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-popover);
  box-shadow: var(--shadow-popover);
  color: var(--color-text);
  display: grid;
  gap: var(--space-1);
  max-height: var(--reka-dropdown-menu-content-available-height);
  min-width: 200px;
  overflow: auto;
  padding: var(--space-1);
  z-index: 31;
}

.app-menu-separator {
  border-top: 1px solid var(--color-divider);
  margin: 0 var(--space-1);
}
</style>
