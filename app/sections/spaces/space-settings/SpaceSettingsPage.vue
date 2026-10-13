<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconSettings"
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
          <form @submit.prevent="update">
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
            <p
              v-if="updateMessage || removeMessage"
              class="form-error">
              {{ updateMessage || removeMessage }}
            </p>
            <div
              v-if="page.canUpdate"
              class="form-actions">
              <BaseButton
                :disabled="removing"
                :loading="updating"
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

import { SpaceIcon } from '~/constants/icons'
import type { SpaceSettingsPageDeps } from '~/sections/spaces/space-settings/SpaceSettingsPage.deps'

const props = defineProps<{
  deps: SpaceSettingsPageDeps
  onDeleted: () => Promise<void> | void
  onUpdated: (spaceKey: string) => Promise<void> | void
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
    deleteConfirm: 'Удалить этот раздел?',
    deleteDescription: 'Удаляет раздел для всех участников. Отменить нельзя.',
    deleteSpace: 'Удалить раздел',
    general: 'Общие',
    key: 'Ключ',
    loadError: 'Не удалось загрузить раздел',
    loading: 'Загрузка раздела…',
    name: 'Название',
    saveChanges: 'Сохранить изменения',
    settings: 'Настройки раздела',
  },
})

const form = reactive({
  color: '',
  key: '',
  name: '',
})

const organizationRoutes = useOrganizationRoutes()

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
    form.key = props.spaceKey
    form.name = value.name
  },
  { immediate: true },
)

const {
  execute: updateSpace,
  message: updateMessage,
  pending: updating,
} = useApiAction(props.deps.update)
const {
  execute: removeSpace,
  message: removeMessage,
  pending: removing,
} = useApiAction(props.deps.remove)
const submitting = computed(() => updating.value || removing.value)

const update = async (): Promise<void> => {
  const key = form.key.trim()
  const input = { color: form.color, name: form.name, newKey: key, oldKey: props.spaceKey }
  if (await updateSpace(input)) {
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
.space-settings-page {
  display: grid;
  gap: var(--space-5);
  margin-inline: auto;
  max-width: 768px;
  width: 100%;
}
</style>
