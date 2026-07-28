<template>
  <dialog ref="dialog">
    <form @submit.prevent="confirmMove">
      <h2>Move {{ ids.length === 1 ? 'space' : 'spaces' }}</h2>
      <label for="movement-space-organization">Organization</label>
      <OrganizationSelect
        id="movement-space-organization"
        v-model="state.organizationId"
        :deps="deps.organizationSelect"
        required />
      <p
        v-if="message"
        class="form-error">
        {{ message }}
      </p>
      <div class="dialog-actions">
        <button
          class="secondary"
          :disabled="moving"
          type="button"
          @click="dialog?.close()">
          Cancel
        </button>
        <button
          class="primary"
          :disabled="moving || !state.organizationId">
          {{ moving ? 'Moving…' : 'Move' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import OrganizationSelect from '~/components/organization-select/OrganizationSelect.vue'

import type { MoveSpacesDialogDeps } from './MoveSpacesDialog.deps'

const props = defineProps<{
  deps: MoveSpacesDialogDeps
  ids: string[]
  onMoved: () => Promise<void> | void
}>()

const state = reactive({
  organizationId: '',
})

const dialog = useTemplateRef('dialog')

const {
  execute: moveSpaces,
  message,
  pending: moving,
} = useAction(props.deps.moveSpaces, {
  onSuccess: async () => {
    dialog.value?.close()
    await props.onMoved()
  },
})

const open = () => {
  message.value = undefined
  state.organizationId = ''
  dialog.value?.showModal()
}

const confirmMove = () => {
  void moveSpaces({ destinationOrganizationId: state.organizationId, spaceIds: props.ids })
}

defineExpose({ open })
</script>
