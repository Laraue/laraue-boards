<!-- Shows the confirmations requested through useConfirm(). Mount it once, next to BaseToasts; the
     app passes its words for the buttons, since the kit has no translations. -->
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
withDefaults(defineProps<{ cancelLabel?: string; confirmLabel?: string; dangerLabel?: string }>(), {
  cancelLabel: 'Cancel',
  confirmLabel: 'Confirm',
  dangerLabel: 'Delete',
})

const request = usePendingConfirm()

const answer = (confirmed: boolean) => {
  const current = request.value
  request.value = null
  current?.resolve(confirmed)
}

let unregister: (() => void) | undefined
onMounted(() => {
  unregister = registerConfirmHost()
})
onBeforeUnmount(() => unregister?.())
</script>
