<template>
  <dialog ref="dialog">
    <form @submit.prevent="confirmMove">
      <h2>Move {{ ids.length === 1 ? 'board' : 'boards' }}</h2>
      <label for="movement-board-organization">Organization</label>
      <OrganizationSelect
        id="movement-board-organization"
        v-model="state.organizationId"
        :deps="deps.organizationSelect"
        :initial-option="{ label: currentOrganizationName, value: currentOrganizationId }"
        required />
      <label for="movement-board-space">Space</label>
      <SpaceSelect
        id="movement-board-space"
        v-model="state.spaceKey"
        :deps="deps.spaceSelect"
        :organization-id="state.organizationId"
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
          :disabled="moving || !state.spaceKey">
          {{ moving ? 'Moving…' : 'Move' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import OrganizationSelect from '~/components/organization-select/OrganizationSelect.vue'
import SpaceSelect from '~/components/space-select/SpaceSelect.vue'

import type { MoveBoardsDialogDeps } from './MoveBoardsDialog.deps'

const props = defineProps<{
  currentOrganizationId: string
  currentOrganizationName: string
  deps: MoveBoardsDialogDeps
  ids: string[]
  onMoved: () => Promise<void> | void
}>()

const state = reactive({
  organizationId: props.currentOrganizationId,
  spaceKey: '',
})

const dialog = useTemplateRef('dialog')

const {
  execute: moveBoards,
  message,
  pending: moving,
} = useAction(props.deps.moveBoards, {
  onSuccess: async () => {
    dialog.value?.close()
    await props.onMoved()
  },
})

const open = () => {
  message.value = undefined
  state.organizationId = props.currentOrganizationId
  state.spaceKey = ''
  dialog.value?.showModal()
}

const confirmMove = () => {
  void moveBoards({
    boardIds: props.ids,
    destinationOrganizationId: state.organizationId,
    destinationSpaceKey: state.spaceKey,
  })
}

defineExpose({ open })
</script>
