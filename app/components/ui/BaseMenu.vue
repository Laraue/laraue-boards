<!-- A menu of actions on Reka DropdownMenu, named by its trigger: arrow keys move between items, Enter picks one, typing a
     letter jumps to it. Items are BaseMenuItem; BaseMenuSeparator splits groups. For a panel with
     fields or sections instead of actions, use BasePopover. -->
<template>
  <!-- The wrapper takes the consumer's class and listeners. -->
  <div class="base-menu-root">
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
        class="base-menu"
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
    side?: 'bottom' | 'right' | 'top'
  }>(),
  { align: 'start', side: 'bottom' },
)

const open = ref(false)
</script>

<style scoped>
/* :where() keeps the root rule lighter than a class the consumer passes, whichever stylesheet
   loads last (they arrive in a different order on the server and after hydration). */
:where(.base-menu-root) {
  width: fit-content;
}
</style>

<style>
/* Unscoped: Reka puts the class on its inner element. The same surface as BasePopover. */
.base-menu {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-popover);
  box-shadow: var(--shadow-popover);
  color: var(--color-text);
  display: grid;
  gap: var(--space-1);
  max-height: var(--reka-dropdown-menu-content-available-height);
  min-width: 8rem; /* 128px, as in shadcn; wider rows stretch it */
  overflow: auto;
  padding: var(--space-1);
  z-index: 31;
}

.base-menu-separator {
  border-top: 1px solid var(--color-divider);
  margin: 0 var(--space-1);
}
</style>
