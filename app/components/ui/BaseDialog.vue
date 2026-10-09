<!-- A modal form on Reka Dialog: a title, an optional description, the fields, the actions at the
     bottom and a close button in the corner. Reka traps focus, closes on Escape or a press on the
     backdrop, locks the page scroll and gives focus back on close. Open and close it through the
     exposed open() and close(); the actions slot's submit button emits `submit`. -->
<template>
  <DialogRoot v-model:open="isOpen">
    <DialogPortal>
      <DialogOverlay class="base-dialog-overlay" />
      <DialogContent
        class="base-dialog"
        @open-auto-focus="focusInitial">
        <form
          ref="form"
          class="base-dialog-form"
          @submit.prevent="emit('submit')">
          <header class="base-dialog-header">
            <DialogTitle class="base-dialog-title">{{ title }}</DialogTitle>
            <DialogDescription
              v-if="description"
              class="base-dialog-description">
              {{ description }}
            </DialogDescription>
          </header>
          <!-- The quickest way out on a phone, where there is no Escape key. -->
          <BaseIconButton
            class="base-dialog-close"
            :label="closeLabel"
            @click="close">
            <IconX />
          </BaseIconButton>
          <slot />
          <div
            v-if="$slots.actions"
            class="dialog-actions">
            <slot name="actions" />
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { IconX } from '@tabler/icons-vue'
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

// The kit has no translations of its own: the app passes the close button's name.
withDefaults(defineProps<{ closeLabel?: string; description?: string; title: string }>(), {
  closeLabel: 'Close',
  description: undefined,
})

const emit = defineEmits<{ close: []; submit: [] }>()

const isOpen = ref(false)
const form = useTemplateRef('form')

const close = () => {
  isOpen.value = false
}

watch(isOpen, (open) => {
  if (!open) {
    emit('close')
  }
})

const fieldSelector =
  // Skips the hidden native selects Reka keeps next to its select triggers for forms.
  ':is(input:not([type="hidden"]), textarea, select, [role="combobox"]):not(:disabled, [aria-hidden="true"], [tabindex="-1"])'

// The first focus follows a rule, not the markup order: an element marked `autofocus`, else the
// first enabled field, else the first action. Fields with async setup (selects that load their
// options) appear a few frames after the dialog, so the dialog holds focus while they arrive.
// ponytail: waits at most 10 frames; a field slower than that gets no focus, the action does.
const focusInitial = (event: Event) => {
  event.preventDefault()
  const content = event.currentTarget as HTMLElement | null
  content?.focus()
  const tryFocus = (framesLeft: number) => {
    const field =
      form.value?.querySelector<HTMLElement>('[autofocus]') ??
      form.value?.querySelector<HTMLElement>(fieldSelector)
    if (field) {
      field.focus()
    } else if (framesLeft > 0) {
      requestAnimationFrame(() => tryFocus(framesLeft - 1))
    } else {
      form.value?.querySelector<HTMLElement>('.dialog-actions button:not(:disabled)')?.focus()
    }
  }
  tryFocus(10)
}

defineExpose({
  close,
  open: () => {
    isOpen.value = true
  },
})
</script>

<style>
/* Unscoped: Reka renders these in a portal, outside this component's root. */
.base-dialog-overlay {
  animation: base-dialog-fade var(--duration-base) var(--ease-standard);
  backdrop-filter: blur(1px);
  background: #00000082;
  inset: 0;
  position: fixed;
  z-index: 45;
}

/* Centred with margins, not a transform: a transformed parent would misplace the fixed popups
   (selects, menus, tooltips) that open inside the dialog. */
.base-dialog {
  animation: base-dialog-enter var(--duration-base) var(--ease-standard);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  color: var(--color-text);
  height: fit-content;
  inset: 0;
  margin: auto;
  max-height: calc(100dvh - var(--space-8));
  overflow: auto;
  padding: var(--space-6);
  position: fixed;
  width: min(27.5rem, calc(100% - var(--space-8)));
  z-index: 46;
}

.base-dialog:focus-visible {
  outline: none;
}

.base-dialog-overlay[data-state='closed'] {
  animation: base-dialog-fade var(--duration-fast) var(--ease-standard) reverse;
}

.base-dialog[data-state='closed'] {
  animation: base-dialog-enter var(--duration-fast) var(--ease-standard) reverse;
}

@keyframes base-dialog-fade {
  from {
    opacity: 0;
  }
}

@keyframes base-dialog-enter {
  from {
    opacity: 0;
    scale: 0.96;
  }
}

.base-dialog-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
}

/* Everything spans the dialog, except the header and the close button sharing the first row. */
.base-dialog-form > * {
  grid-column: 1 / -1;
}

.base-dialog-form > .base-dialog-header {
  display: grid;
  gap: var(--space-1);
  grid-column: 1;
  grid-row: 1;
  margin-bottom: var(--space-4);
}

.base-dialog-form > .base-dialog-close {
  grid-column: 2;
  grid-row: 1;
  margin: calc(-1 * var(--space-1)) calc(-1 * var(--space-2)) 0 var(--space-2);
}

.base-dialog-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-heading);
  margin: 0;
}

.base-dialog-description {
  color: var(--color-muted);
  margin: 0;
}

/* Field labels in a dialog read as quiet captions above their controls. */
.base-dialog-form label:not(.base-checkbox) {
  color: var(--color-muted);
  font-weight: 400;
  margin: var(--space-4) 0 var(--space-2);
}

.base-dialog-form label:not(.base-checkbox):first-of-type {
  margin-top: 0;
}
</style>
