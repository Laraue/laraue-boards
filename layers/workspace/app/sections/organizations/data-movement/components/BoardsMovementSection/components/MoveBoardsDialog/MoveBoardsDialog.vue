<template>
  <BaseDialog
    ref="dialog"
    :close-label="t('close')"
    :title="ids.length === 1 ? t('moveBoard') : t('moveBoards')"
    @submit="confirmMove">
    <BaseFieldGroup>
      <BaseField
        id="movement-board-organization"
        :label="t('organization')">
        <OrganizationSelect
          id="movement-board-organization"
          v-model="state.organizationId"
          :deps="deps.organizationSelect"
          :initial-option="{ label: currentOrganizationName, value: currentOrganizationId }"
          required />
      </BaseField>
      <BaseField
        id="movement-board-space"
        :label="t('space')">
        <SpaceSelect
          id="movement-board-space"
          v-model="state.spaceKey"
          :deps="deps.spaceSelect"
          :organization-id="state.organizationId"
          required />
      </BaseField>
    </BaseFieldGroup>
    <p
      v-if="message || unusedMessage"
      class="form-error">
      {{ message || unusedMessage }}
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
import { computed, reactive, useTemplateRef } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseDialog from '#layers/core/app/ui/components/BaseDialog.vue'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import BaseFieldGroup from '#layers/core/app/ui/components/BaseFieldGroup.vue'
import OrganizationSelect from '#layers/workspace/app/sections/organizations/shared/components/OrganizationSelect/OrganizationSelect.vue'
import SpaceSelect from '#layers/workspace/app/sections/spaces/shared/components/SpaceSelect/SpaceSelect.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useAttributeValuesChoice } from '#layers/workspace/app/shared/composables/useAttributeValuesChoice'

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
    space: 'Пространство',
  },
})

const state = reactive({
  organizationId: props.currentOrganizationId,
  spaceKey: '',
})

const dialog = useTemplateRef('dialog')

const { execute: moveBoards, message, pending: movingBoards } = useApiAction(props.deps.moveBoards)
const {
  execute: findUnusedAttributes,
  message: unusedMessage,
  pending: checking,
} = useApiAction(props.deps.unusedAttributes)
const chooseAttributeValues = useAttributeValuesChoice()
const moving = computed(() => movingBoards.value || checking.value)

const open = () => {
  message.value = undefined
  state.organizationId = props.currentOrganizationId
  state.spaceKey = ''
  dialog.value?.open()
}

const confirmMove = async () => {
  const destination = {
    boardIds: props.ids,
    destinationOrganizationId: state.organizationId,
    destinationSpaceKey: state.spaceKey,
  }
  const unused = await findUnusedAttributes(destination)
  if (!unused) {
    return
  }
  const dropUnusedAttributeValues = await chooseAttributeValues(unused.value)
  const moved = await moveBoards({ ...destination, dropUnusedAttributeValues })
  if (moved) {
    dialog.value?.close()
    await props.onMoved()
  }
}

defineExpose({ open })
</script>
