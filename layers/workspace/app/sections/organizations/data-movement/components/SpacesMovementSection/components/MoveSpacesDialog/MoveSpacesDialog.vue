<template>
  <BaseDialog
    ref="dialog"
    :close-label="t('close')"
    :title="ids.length === 1 ? t('moveSpace') : t('moveSpaces')"
    @submit="confirmMove">
    <BaseFieldGroup>
      <BaseField
        id="movement-space-organization"
        :label="t('organization')">
        <OrganizationSelect
          id="movement-space-organization"
          v-model="state.organizationId"
          :deps="deps.organizationSelect"
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
        :disabled="moving || !state.organizationId"
        :loading="moving"
        type="submit"
        variant="primary">
        {{ moving ? t('moving') : t('move') }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { reactive, useTemplateRef } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseDialog from '#layers/core/app/ui/components/BaseDialog.vue'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import BaseFieldGroup from '#layers/core/app/ui/components/BaseFieldGroup.vue'
import OrganizationSelect from '#layers/workspace/app/sections/organizations/shared/components/OrganizationSelect/OrganizationSelect.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'

import type { MoveSpacesDialogDeps } from './MoveSpacesDialog.deps'

const props = defineProps<{
  deps: MoveSpacesDialogDeps
  ids: string[]
  onMoved: () => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    cancel: 'Cancel',
    close: 'Close',
    move: 'Move',
    moveSpace: 'Move space',
    moveSpaces: 'Move spaces',
    moving: 'Moving…',
    organization: 'Organization',
  },
  ru: {
    cancel: 'Отмена',
    close: 'Закрыть',
    move: 'Переместить',
    moveSpace: 'Переместить пространство',
    moveSpaces: 'Переместить пространства',
    moving: 'Перемещение…',
    organization: 'Организация',
  },
})

const state = reactive({
  organizationId: '',
})

const dialog = useTemplateRef('dialog')

const { execute: moveSpaces, message, pending: moving } = useApiAction(props.deps.moveSpaces)

const open = () => {
  message.value = undefined
  state.organizationId = ''
  dialog.value?.open()
}

const confirmMove = async () => {
  if (await moveSpaces({ destinationOrganizationId: state.organizationId, spaceKeys: props.ids })) {
    dialog.value?.close()
    await props.onMoved()
  }
}

defineExpose({ open })
</script>
