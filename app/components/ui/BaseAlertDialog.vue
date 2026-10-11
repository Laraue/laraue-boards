<!-- A confirmation on Reka AlertDialog: a question, an optional explanation and two buttons. It
     opens with focus on Cancel, so a stray Enter never confirms, and a press on the backdrop does
     not close it. Usually shown through useConfirm() rather than placed by hand. -->
<template>
  <AlertDialogRoot
    :open="open"
    @update:open="(value) => emit('update:open', value)">
    <AlertDialogPortal>
      <AlertDialogOverlay class="base-dialog-overlay" />
      <AlertDialogContent class="base-dialog base-alert-dialog">
        <AlertDialogTitle class="base-alert-dialog-title">{{ title }}</AlertDialogTitle>
        <AlertDialogDescription
          v-if="description"
          class="base-alert-dialog-description">
          {{ description }}
        </AlertDialogDescription>
        <div class="dialog-actions">
          <AlertDialogCancel as-child>
            <BaseButton>{{ cancelLabel }}</BaseButton>
          </AlertDialogCancel>
          <!-- Not a Reka AlertDialogAction: that closes the dialog itself, and the close could be read
               as a cancel before the click. The owner closes it after taking the answer. -->
          <BaseButton
            :variant="danger ? 'danger' : 'primary'"
            @click="emit('action')">
            {{ actionLabel }}
          </BaseButton>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>

<script setup lang="ts">
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from 'reka-ui'

defineProps<{
  actionLabel: string
  cancelLabel: string
  danger?: boolean
  description?: string
  open: boolean
  title: string
}>()

const emit = defineEmits<{ action: []; 'update:open': [value: boolean] }>()
</script>

<style>
/* Unscoped: Reka renders the content in a portal. The surface itself is in ui/styles/base.css. */
.base-alert-dialog-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-heading);
  margin: 0;
}

/* The one filled destructive button: the action that confirms a deletion. Elsewhere a danger button
   is a red label. */
.base-alert-dialog .dialog-actions .base-button.danger {
  background: var(--color-danger-action);
  border-color: var(--color-danger-action);
  color: var(--color-on-action);
}

.base-alert-dialog .dialog-actions .base-button.danger:focus-visible {
  box-shadow: inset 0 0 0 1px var(--color-surface);
}

@media (hover: hover) and (pointer: fine) {
  .base-alert-dialog .dialog-actions .base-button.danger:hover:not(:disabled) {
    border-color: var(--color-danger-action-hover);
  }
}

.base-alert-dialog-description {
  color: var(--color-muted);
  margin: var(--space-2) 0 0;
}
</style>
