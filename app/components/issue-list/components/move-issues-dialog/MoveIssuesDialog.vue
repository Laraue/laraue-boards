<template>
  <BaseDialog
    ref="dialog"
    :title="`${t('move')} ${tp('issues', state.issueKeys.length)}`"
    @submit="move">
    <label :for="`${idPrefix}-space`">{{ t('space') }}</label>
    <SpaceSelect
      :id="`${idPrefix}-space`"
      v-model="state.spaceKey"
      :deps="deps.spaceSelect"
      :disabled="moving"
      required />
    <label :for="`${idPrefix}-board`">{{ t('board') }}</label>
    <BoardSelect
      :id="`${idPrefix}-board`"
      v-model="state.boardId"
      :deps="deps.boardSelect"
      :disabled="moving"
      :excluded-value="excludedBoardId"
      required
      :space-key="state.spaceKey" />
    <label :for="`${idPrefix}-status`">{{ t('status') }}</label>
    <StatusSelect
      :id="`${idPrefix}-status`"
      v-model="state.statusId"
      :board-id="state.boardId"
      :deps="deps.statusSelect"
      :disabled="moving"
      :placeholder="t('selectStatus')"
      required />
    <p
      v-if="message"
      class="form-error">
      {{ message }}
    </p>
    <template #actions>
      <BaseButton
        :disabled="moving"
        @click="dialog?.close()">
        {{ t('cancel') }}
      </BaseButton>
      <BaseButton
        :disabled="!state.statusId"
        :loading="moving"
        type="submit"
        variant="primary">
        {{ moving ? t('moving') : t('move') }}
      </BaseButton>
    </template>
  </BaseDialog>
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

const { t, tp } = useI18n({
  en: {
    board: 'Board',
    cancel: 'Cancel',
    issues: 'issue|issues',
    move: 'Move',
    moving: 'Moving…',
    selectStatus: 'Select status',
    space: 'Space',
    status: 'Status',
  },
  ru: {
    board: 'Доска',
    cancel: 'Отмена',
    issues: 'задачу|задачи|задач',
    move: 'Переместить',
    moving: 'Перемещение…',
    selectStatus: 'Выберите статус',
    space: 'Раздел',
    status: 'Статус',
  },
})

const idPrefix = useId()

const dialog = useTemplateRef('dialog')

const state = reactive({
  boardId: '',
  issueKeys: [] as string[],
  spaceKey: '',
  statusId: '',
})

const { execute: moveIssues, message, pending: moving } = useApiAction(props.deps.moveIssues)

const open = (issueKeys: string[]) => {
  message.value = undefined
  Object.assign(state, { boardId: '', issueKeys, spaceKey: '', statusId: '' })
  dialog.value?.open()
}

const move = async (): Promise<void> => {
  if (await moveIssues({ issueKeys: state.issueKeys, statusId: state.statusId })) {
    dialog.value?.close()
    await props.onMoved()
  }
}

watch(
  () => [state.spaceKey, state.boardId, state.statusId],
  () => {
    message.value = undefined
  },
)

defineExpose({ open })
</script>
