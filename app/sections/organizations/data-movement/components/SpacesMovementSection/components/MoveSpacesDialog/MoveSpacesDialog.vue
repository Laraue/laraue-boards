<template>
  <dialog ref="dialog">
    <form @submit.prevent="confirmMove">
      <h2>{{ ids.length === 1 ? t('moveSpace') : t('moveSpaces') }}</h2>
      <label for="movement-space-organization">{{ t('organization') }}</label>
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
          {{ t('cancel') }}
        </button>
        <button
          class="primary"
          :disabled="moving || !state.organizationId">
          {{ moving ? t('moving') : t('move') }}
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

const { t } = useI18n({
  en: {
    cancel: 'Cancel',
    move: 'Move',
    moveSpace: 'Move space',
    moveSpaces: 'Move spaces',
    moving: 'Moving…',
    organization: 'Organization',
  },
  ru: {
    cancel: 'Отмена',
    move: 'Переместить',
    moveSpace: 'Переместить раздел',
    moveSpaces: 'Переместить разделы',
    moving: 'Перемещение…',
    organization: 'Организация',
  },
})

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
  void moveSpaces({ destinationOrganizationId: state.organizationId, spaceKeys: props.ids })
}

defineExpose({ open })
</script>
