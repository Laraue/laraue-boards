<template>
  <BaseDialog
    ref="dialog"
    :close-label="t('close')"
    :title="ids.length === 1 ? t('moveBoard') : t('moveBoards')"
    @submit="confirmMove">
    <label for="movement-board-organization">{{ t('organization') }}</label>
    <OrganizationSelect
      id="movement-board-organization"
      v-model="state.organizationId"
      :deps="deps.organizationSelect"
      :initial-option="{ label: currentOrganizationName, value: currentOrganizationId }"
      required />
    <label for="movement-board-space">{{ t('space') }}</label>
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
    <template #actions>
      <BaseButton
        :disabled="moving"
        @click="dialog?.close()">
        {{ t('cancel') }}
      </BaseButton>
      <BaseButton
        :disabled="moving || !state.spaceKey"
        :loading="moving"
        type="submit"
        variant="primary">
        {{ moving ? t('moving') : t('move') }}
      </BaseButton>
    </template>
  </BaseDialog>
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

const { t } = useI18n({
  en: {
    cancel: 'Cancel',
    close: 'Close',
    move: 'Move',
    moveBoard: 'Move board',
    moveBoards: 'Move boards',
    moving: 'Moving…',
    organization: 'Organization',
    space: 'Space',
  },
  ru: {
    cancel: 'Отмена',
    close: 'Закрыть',
    move: 'Переместить',
    moveBoard: 'Переместить доску',
    moveBoards: 'Переместить доски',
    moving: 'Перемещение…',
    organization: 'Организация',
    space: 'Раздел',
  },
})

const state = reactive({
  organizationId: props.currentOrganizationId,
  spaceKey: '',
})

const dialog = useTemplateRef('dialog')

const { execute: moveBoards, message, pending: moving } = useApiAction(props.deps.moveBoards)

const open = () => {
  message.value = undefined
  state.organizationId = props.currentOrganizationId
  state.spaceKey = ''
  dialog.value?.open()
}

const confirmMove = async () => {
  const moved = await moveBoards({
    boardIds: props.ids,
    destinationOrganizationId: state.organizationId,
    destinationSpaceKey: state.spaceKey,
  })
  if (moved) {
    dialog.value?.close()
    await props.onMoved()
  }
}

defineExpose({ open })
</script>
