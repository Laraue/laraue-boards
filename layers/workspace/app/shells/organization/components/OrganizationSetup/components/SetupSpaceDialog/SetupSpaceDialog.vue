<!-- The first window of the organization setup: name the space sign-up created. -->
<template>
  <BaseDialog
    ref="dialog"
    :close-label="t('close')"
    :description="t('description')"
    :title="t('title')"
    @submit="submit">
    <BaseFieldGroup>
      <BaseField
        id="setup-space-name"
        :label="t('name')">
        <BaseInput
          id="setup-space-name"
          v-model="state.name"
          :disabled="pending"
          maxlength="128"
          minlength="3"
          required
          @update:model-value="suggestKey" />
      </BaseField>
      <BaseField
        id="setup-space-key"
        :hint="t('keyHint', { key: state.key || 'ABC' })"
        :label="t('key')">
        <BaseInput
          id="setup-space-key"
          :disabled="pending"
          maxlength="3"
          minlength="3"
          :model-value="state.key"
          required
          @update:model-value="editKey" />
      </BaseField>
      <!-- A new key renames the keys of the issues already in the space (saved from Telegram before the
           setup). -->
      <p
        v-if="space.issueCount"
        class="setup-warning"
        role="note">
        <IconAlertTriangle class="setup-warning-icon" />
        {{ t('keyWarning', { count: space.issueCount }) }}
      </p>
    </BaseFieldGroup>

    <p
      v-if="message"
      class="form-error">
      {{ message }}
    </p>

    <template #actions>
      <BaseButton
        :loading="pending"
        type="submit"
        variant="primary">
        <IconArrowRight />
        {{ t('next') }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconArrowRight } from '@tabler/icons-vue'
import { onMounted, reactive, useTemplateRef } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseDialog from '#layers/core/app/ui/components/BaseDialog.vue'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import BaseFieldGroup from '#layers/core/app/ui/components/BaseFieldGroup.vue'
import BaseInput from '#layers/core/app/ui/components/BaseInput.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'

import type { SetupSpaceDialogDeps } from './SetupSpaceDialog.deps'

const props = defineProps<{
  deps: SetupSpaceDialogDeps
  // `renamed` is false when the name and key were kept.
  onNext: (space: { key: string; renamed: boolean }) => Promise<void> | void
  space: { color: string; issueCount: number; key: string; name: string }
}>()

const { t } = useI18n({
  en: {
    close: 'Close',
    description:
      "Two quick steps and you're ready. First, name the space your issues go to, after your team or project.",
    key: 'Key',
    keyHint: 'Three letters that start every issue key, like {key}-1.',
    keyWarning:
      'The space has {count} issues already. A new key changes their keys and links, and old links stop working.',
    name: 'Space name',
    next: 'Next',
    title: 'Finish setting up your organization',
  },
  ru: {
    close: 'Закрыть',
    description:
      'Два коротких шага, и можно начинать. Сначала назовите пространство, куда попадают задачи, по команде или проекту.',
    key: 'Ключ',
    keyHint: 'Три буквы, с которых начинается ключ каждой задачи, например {key}-1.',
    keyWarning:
      'В пространстве уже есть задачи: {count}. Новый ключ изменит их ключи и ссылки, старые ссылки перестанут работать.',
    name: 'Название пространства',
    next: 'Далее',
    title: 'Завершите настройку организации',
  },
})

const dialog = useTemplateRef('dialog')

const state = reactive({
  key: props.space.key,
  keyEdited: false,
  name: props.space.name,
})

// Until the key is typed by hand, it follows the name: its first three Latin letters.
const suggestKey = (name: string) => {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '')
  if (!state.keyEdited && letters.length >= 3) {
    state.key = letters.slice(0, 3)
  }
}

const editKey = (key: string) => {
  state.keyEdited = true
  state.key = key.toUpperCase()
}

const { execute, message, pending } = useApiAction(props.deps.renameSpace)

const submit = async () => {
  if (pending.value) {
    return
  }
  const name = state.name.trim()
  const renamed = name !== props.space.name || state.key !== props.space.key
  if (
    renamed &&
    !(await execute({ color: props.space.color, key: props.space.key, name, newKey: state.key }))
  ) {
    return
  }
  await props.onNext({ key: state.key, renamed })
}

onMounted(() => dialog.value?.open())
</script>

<style scoped>
.setup-warning {
  align-items: flex-start;
  background: var(--color-warning-soft);
  border-radius: var(--radius-control);
  color: var(--color-warning);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-2) var(--space-3);
}

.setup-warning-icon {
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}
</style>
