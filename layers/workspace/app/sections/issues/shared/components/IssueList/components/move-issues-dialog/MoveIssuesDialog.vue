<template>
  <BaseDialog
    ref="dialog"
    :close-label="t('close')"
    :title="`${t('move')} ${tp('issues', state.issueKeys.length)}`"
    @submit="move">
    <BaseFieldGroup>
      <BaseField
        :id="`${idPrefix}-space`"
        :label="t('space')">
        <SpaceSelect
          :id="`${idPrefix}-space`"
          v-model="state.spaceKey"
          :deps="deps.spaceSelect"
          :disabled="moving"
          required />
      </BaseField>
      <BaseField
        :id="`${idPrefix}-board`"
        :label="t('board')">
        <BoardSelect
          :id="`${idPrefix}-board`"
          v-model="state.boardId"
          :deps="deps.boardSelect"
          :disabled="moving"
          :excluded-value="excludedBoardId"
          required
          :space-key="state.spaceKey" />
      </BaseField>
      <BaseField
        :id="`${idPrefix}-status`"
        :label="t('status')">
        <StatusSelect
          :id="`${idPrefix}-status`"
          v-model="state.statusId"
          :board-id="state.boardId"
          :deps="deps.statusSelect"
          :disabled="moving"
          :placeholder="t('selectStatus')"
          required />
      </BaseField>
    </BaseFieldGroup>
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
import { reactive, useId, useTemplateRef, watch } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseDialog from '#layers/core/app/ui/components/BaseDialog.vue'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import BaseFieldGroup from '#layers/core/app/ui/components/BaseFieldGroup.vue'
import BoardSelect from '#layers/workspace/app/sections/boards/shared/components/BoardSelect/BoardSelect.vue'
import StatusSelect from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.vue'
import SpaceSelect from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'

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
    close: 'Close',
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
    close: 'Закрыть',
    issues: 'задачу|задачи|задач',
    move: 'Переместить',
    moving: 'Перемещение…',
    selectStatus: 'Выберите статус',
    space: 'Пространство',
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
