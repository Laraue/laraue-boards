import type { Ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

export const confirmUnsavedChanges = (dirty: boolean) =>
  !dirty || confirm('You have unsaved changes. Leave this page?')

export const useUnsavedChangesWarning = (dirty: Readonly<Ref<boolean>>) => {
  const confirmLeaving = () => confirmUnsavedChanges(dirty.value)

  onBeforeRouteLeave(confirmLeaving)
  onMounted(() => window.addEventListener('beforeunload', warnBeforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', warnBeforeUnload))

  function warnBeforeUnload(event: BeforeUnloadEvent) {
    if (dirty.value) {
      event.preventDefault()
    }
  }

  return { confirmUnsavedChanges: confirmLeaving }
}
