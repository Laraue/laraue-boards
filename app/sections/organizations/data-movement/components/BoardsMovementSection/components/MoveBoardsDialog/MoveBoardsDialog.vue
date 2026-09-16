<template>
  <dialog ref="dialog">
    <form @submit.prevent="confirmMove">
      <h2>{{ ids.length === 1 ? t('moveBoard') : t('moveBoards') }}</h2>
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
      <div class="dialog-actions">
        <button
          class="secondary"
          :disabled="moving"
          type="button"
          @click="dialog?.close()">
          {{ t('cancel') }}
        </button>
        <button
          class="primary"
          :disabled="moving || !state.spaceKey">
          {{ moving ? t('moving') : t('move') }}
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

const { t } = useI18n({
  en: {
    cancel: 'Cancel',
    move: 'Move',
    moveBoard: 'Move board',
    moveBoards: 'Move boards',
    moving: 'Moving…',
    organization: 'Organization',
    space: 'Space',
  },
  ru: {
    cancel: 'Отмена',
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
