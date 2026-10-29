<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconSettings"
        :on-refresh="refresh"
        :parents="[
          {
            color: data?.color,
            icon: SpaceIcon,
            label: data?.name ?? spaceKey,
            to: organizationRoutes.space(spaceKey),
          },
        ]"
        :title="t('settings')" />
    </template>
    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: page }">
        <section class="space-settings-page">
          <BaseSectionHeader :title="t('general')" />
          <form
            class="space-settings-form"
            @submit.prevent="save">
            <BaseFieldGroup>
              <BaseField
                id="space-settings-name"
                :label="t('name')">
                <BaseInput
                  id="space-settings-name"
                  v-model="form.name"
                  :disabled="!page.canUpdate || submitting"
                  required />
              </BaseField>
              <BaseField
                id="space-settings-key"
                :label="t('key')">
                <BaseInput
                  id="space-settings-key"
                  v-model="form.key"
                  :disabled="!page.canUpdate || submitting"
                  required />
              </BaseField>
              <BaseField
                v-slot="{ labelId }"
                :label="t('color')">
                <AppColorPicker
                  v-model="form.color"
                  :aria-labelledby="labelId"
                  :disabled="!page.canUpdate || submitting" />
              </BaseField>
            </BaseFieldGroup>
            <SpaceAboutFields
              v-model:description="form.description"
              v-model:links="form.links"
              :disabled="!page.canUpdate || submitting" />
            <p
              v-if="saveMessage || removeMessage"
              class="form-error">
              {{ saveMessage || removeMessage }}
            </p>
            <div
              v-if="page.canUpdate"
              class="form-actions">
              <BaseButton
                :disabled="removing"
                :loading="saving"
                type="submit"
                variant="primary">
                {{ t('saveChanges') }}
              </BaseButton>
            </div>
          </form>
          <BaseDangerZone
            v-if="page.canDelete"
            :description="t('deleteDescription')"
            :title="t('deleteSpace')">
            <BaseButton
              :disabled="submitting"
              :loading="removing"
              variant="danger"
              @click="remove">
              {{ t('deleteSpace') }}
            </BaseButton>
          </BaseDangerZone>
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import { IconSettings } from '@tabler/icons-vue'
import { computed, reactive, watch } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseDangerZone from '#layers/core/app/ui/components/BaseDangerZone.vue'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import BaseFieldGroup from '#layers/core/app/ui/components/BaseFieldGroup.vue'
import BaseInput from '#layers/core/app/ui/components/BaseInput.vue'
import BaseSectionHeader from '#layers/core/app/ui/components/BaseSectionHeader.vue'
import { useConfirm } from '#layers/core/app/ui/composables/useConfirm'
import SpaceAboutFields from '#layers/workspace/app/sections/spaces/space-settings/components/SpaceAboutFields/SpaceAboutFields.vue'
import type {
  SpaceLinkDraft,
  SpaceSettingsPageDeps,
} from '#layers/workspace/app/sections/spaces/space-settings/SpaceSettingsPage.deps'
import AppColorPicker from '#layers/workspace/app/shared/components/AppColorPicker.vue'
import AppPage from '#layers/workspace/app/shared/components/AppPage.vue'
import PageHeader from '#layers/workspace/app/shared/components/PageHeader.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import { useUnsavedChangesWarning } from '#layers/workspace/app/shared/composables/useUnsavedChangesWarning'
import { SpaceIcon } from '#layers/workspace/app/shared/constants/icons'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  deps: SpaceSettingsPageDeps
  onDeleted: () => Promise<void> | void
  onUpdated: (spaceKey: string) => Promise<void> | void
  organizationRoutes: OrganizationRoutes
  spaceKey: string
}>()

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    color: 'Color',
    deleteConfirm: 'Delete this space?',
    deleteDescription: 'Deletes the space for every member. This cannot be undone.',
    deleteSpace: 'Delete space',
    general: 'General',
    key: 'Key',
    loadError: 'Could not load space',
    loading: 'Loading space…',
    name: 'Name',
    saveChanges: 'Save changes',
    settings: 'Space settings',
  },
  ru: {
    color: 'Цвет',
    deleteConfirm: 'Удалить это пространство?',
    deleteDescription: 'Удаляет пространство для всех участников. Отменить нельзя.',
    deleteSpace: 'Удалить пространство',
    general: 'Общие',
    key: 'Ключ',
    loadError: 'Не удалось загрузить пространство',
    loading: 'Загрузка пространства…',
    name: 'Название',
    saveChanges: 'Сохранить изменения',
    settings: 'Настройки пространства',
  },
})

const form = reactive<{
  color: string
  description: string
  key: string
  links: SpaceLinkDraft[]
  name: string
}>({
  color: '',
  description: '',
  key: '',
  links: [],
  name: '',
})

// Set once saved, so leaving for the space page doesn't ask about changes that were just saved.
const state = reactive({ saved: false })

const { data, message, pending, refresh } = await useApiQuery(
  () => `space-settings:${props.spaceKey}`,
  (signal) => props.deps.view({ signal, spaceKey: props.spaceKey }),
)

watch(
  data,
  (value) => {
    if (!value) {
      return
    }
    form.color = value.color
    form.description = value.description
    form.key = props.spaceKey
    form.links = value.links.map((link) => ({ ...link }))
    form.name = value.name
  },
  { immediate: true },
)

const { execute: saveSpace, message: saveMessage, pending: saving } = useApiAction(props.deps.save)
const {
  execute: removeSpace,
  message: removeMessage,
  pending: removing,
} = useApiAction(props.deps.remove)
const submitting = computed(() => saving.value || removing.value)

// Rows left empty aren't links.
const filledLinks = (): SpaceLinkDraft[] =>
  form.links
    .map((link) => ({ ...link, description: link.description.trim(), url: link.url.trim() }))
    .filter((link) => link.url || link.description)

const dirty = computed(() => {
  const loaded = data.value
  if (!loaded || state.saved) {
    return false
  }
  return (
    form.name !== loaded.name ||
    form.color !== loaded.color ||
    form.key.trim() !== props.spaceKey ||
    form.description.trim() !== loaded.description.trim() ||
    JSON.stringify(filledLinks()) !==
      JSON.stringify(loaded.links.map(({ description, id, url }) => ({ description, id, url })))
  )
})

useUnsavedChangesWarning(dirty)

const save = async (): Promise<void> => {
  const key = form.key.trim()
  const saved = await saveSpace({
    color: form.color,
    description: form.description,
    links: filledLinks(),
    name: form.name,
    newKey: key,
    oldKey: props.spaceKey,
  })
  if (saved) {
    state.saved = true
    await props.onUpdated(key)
  }
}

const remove = async (): Promise<void> => {
  if (
    (await confirm({ danger: true, title: t('deleteConfirm') })) &&
    (await removeSpace({ spaceKey: props.spaceKey }))
  ) {
    await props.onDeleted()
  }
}
</script>

<style scoped>
.space-settings-form {
  display: grid;
  gap: var(--space-5);
}

.space-settings-page {
  display: grid;
  gap: var(--space-5);
  margin-inline: auto;
  max-width: 768px;
  width: 100%;
}
</style>
