<template>
  <!-- The wrapper takes the consumer's class, so a width set on it (--base-popover-width) reaches
       the content, which is not portaled: outside an open <dialog> it would be under it and inert. -->
  <div
    ref="root"
    class="base-popover">
    <PopoverRoot v-model:open="open">
      <PopoverAnchor>
        <slot
          name="trigger"
          :open="open"
          :toggle="toggle" />
      </PopoverAnchor>
      <PopoverContent
        :align="align"
        class="base-popover-content"
        :collision-padding="viewportPadding"
        :side="side"
        :side-offset="8"
        @close-auto-focus="focusTrigger"
        @interact-outside="keepOpenForTrigger">
        <slot :close="close" />
      </PopoverContent>
    </PopoverRoot>
  </div>
</template>

<script setup lang="ts">
import { PopoverAnchor, PopoverContent, PopoverRoot } from 'reka-ui'

withDefaults(
  defineProps<{
    align?: 'end' | 'start'
    side?: 'bottom' | 'right'
    viewportPadding?: number
  }>(),
  { align: 'start', side: 'bottom', viewportPadding: 16 },
)

const root = useTemplateRef('root')
const open = ref(false)
let leftByOutside = false

const close = () => {
  open.value = false
}

const toggle = () => {
  open.value = !open.value
  leftByOutside = false
}

// The trigger is the consumer's own button, not a Reka trigger: a press on it is "outside" for
// Reka, which would close the popover just before the button's click toggles it open again.
// The content lives inside the wrapper too, but Reka reports only presses outside the content.
const keepOpenForTrigger = (event: Event) => {
  if (root.value?.contains(event.target as Node)) {
    event.preventDefault()
  } else {
    leftByOutside = true
  }
}

// Back to the trigger on close, as a Reka trigger would, unless the user went elsewhere. Reka may
// call this more than once per close, so the flag is reset only when the popover opens.
const focusTrigger = (event: Event) => {
  event.preventDefault()
  if (!leftByOutside) {
    root.value?.querySelector<HTMLElement>('button, summary, a')?.focus()
  }
}
</script>

<style scoped>
.base-popover {
  position: relative;
  width: fit-content;
}
</style>

<style>
/* Unscoped: Reka puts the class on its inner element and the scope id on its own wrapper. */
.base-popover-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-popover);
  box-shadow: var(--shadow-popover);
  color: var(--color-text);
  max-height: var(--reka-popover-content-available-height);
  max-width: calc(100vw - var(--space-8));
  overflow: auto;
  width: var(--base-popover-width, max-content);
  z-index: 31;
}
</style>
