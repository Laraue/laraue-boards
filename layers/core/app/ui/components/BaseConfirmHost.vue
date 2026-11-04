<template>
  <BaseAlertDialog
    :action-label="request?.action ?? (request?.danger ? dangerLabel : confirmLabel)"
    :cancel-label="cancelLabel"
    :danger="request?.danger"
    :description="request?.description"
    :open="request !== null"
    :title="request?.title ?? ''"
    @action="answer(true)"
    @update:open="(open) => !open && answer(false)" />
</template>

<script setup lang="ts">
import BaseAlertDialog from '#layers/core/app/ui/components/BaseAlertDialog.vue'
import type { PendingConfirm } from '#layers/core/app/ui/feedback/createConfirmation'

withDefaults(
  defineProps<{
    answer: (confirmed: boolean) => void
    cancelLabel?: string
    confirmLabel?: string
    dangerLabel?: string
    request: null | PendingConfirm
  }>(),
  { cancelLabel: 'Cancel', confirmLabel: 'Confirm', dangerLabel: 'Delete' },
)
</script>
