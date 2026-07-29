<template>
  <dialog ref="dialog">
    <form @submit.prevent="move">
      <h2>
        Move {{ state.issueKeys.length }}
        {{ state.issueKeys.length === 1 ? 'issue' : 'issues' }}
      </h2>
      <label :for="`${idPrefix}-space`">Space</label>
      <SpaceSelect
        :id="`${idPrefix}-space`"
        v-model="state.spaceKey"
        :deps="deps.spaceSelect"
        :disabled="moving"
        required />
      <label :for="`${idPrefix}-board`">Board</label>
      <BoardSelect
        :id="`${idPrefix}-board`"
        v-model="state.boardId"
        :deps="deps.boardSelect"
        :disabled="moving"
        :excluded-value="excludedBoardId"
        required
        :space-key="state.spaceKey" />
      <label :for="`${idPrefix}-status`">Column</label>
      <StatusSelect
        :id="`${idPrefix}-status`"
        v-model="state.statusId"
        :board-id="state.boardId"
        :deps="deps.statusSelect"
        :disabled="moving"
        placeholder="Select column"
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
          :disabled="moving || !state.statusId">
          {{ moving ? 'Moving…' : 'Move' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import BoardSelect from '~/components/board-select/BoardSelect.vue'
import SpaceSelect from '~/components/space-select/SpaceSelect.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'

import type { MoveIssuesDialogDeps } from './MoveIssuesDialog.deps'

const props = defineProps<{
  deps: MoveIssuesDialogDeps
  excludedBoardId?: string
  onMoved: () => Promise<void> | void
}>()

const idPrefix = useId()

const dialog = useTemplateRef('dialog')

const state = reactive({
  boardId: '',
  issueKeys: [] as string[],
  spaceKey: '',
  statusId: '',
})

const {
  execute: moveIssues,
  message,
  pending: moving,
} = useAction(props.deps.moveIssues, {
  onSuccess: async () => {
    dialog.value?.close()
    await props.onMoved()
  },
})

const open = (issueKeys: string[]) => {
  message.value = undefined
  Object.assign(state, { boardId: '', issueKeys, spaceKey: '', statusId: '' })
  dialog.value?.showModal()
}

const move = () => {
  void moveIssues({ issueKeys: state.issueKeys, statusId: state.statusId })
}

watch(
  () => [state.spaceKey, state.boardId, state.statusId],
  () => {
    message.value = undefined
  },
)

defineExpose({ open })
</script>
