<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="form-page">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              :label="t('backToSpace')"
              :to="organizationRoutes.space(spaceKey)" />
            <SpaceIcon
              class="page-heading-icon"
              :style="{ color: form.color }" />
            <div class="page-heading-text">
              <h1>{{ t('editSpace') }}</h1>
            </div>
          </div>
        </div>
        <form @submit.prevent="update">
          <label for="space-settings-name">{{ t('name') }}</label>
          <input
            id="space-settings-name"
            v-model="form.name"
            :disabled="!page.canUpdate"
            required />
          <label for="space-settings-key">{{ t('key') }}</label>
          <input
            id="space-settings-key"
            v-model="form.key"
            :disabled="!page.canUpdate"
            required />
          <label>{{ t('color') }}</label>
          <AppColorPicker
            v-model="form.color"
            :disabled="!page.canUpdate" />
          <p
            v-if="updateMessage || removeMessage"
            class="form-error">
            {{ updateMessage || removeMessage }}
          </p>
          <div class="form-actions">
            <button
              v-if="page.canUpdate"
              class="primary"
              :disabled="submitting"
              type="submit">
              {{ updating ? t('saving') : t('saveChanges') }}
            </button>
            <button
              v-if="page.canDelete"
              class="secondary danger"
              :disabled="submitting"
              type="button"
              @click="remove">
              {{ t('deleteSpace') }}
            </button>
          </div>
        </form>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { SpaceIcon } from '~/constants/icons'
import type { SpaceSettingsPageDeps } from '~/sections/spaces/space-settings/SpaceSettingsPage.deps'

const props = defineProps<{
  deps: SpaceSettingsPageDeps
  onDeleted: () => Promise<void> | void
  onUpdated: (spaceKey: string) => Promise<void> | void
  spaceKey: string
}>()

const { t } = useI18n({
  en: {
    backToSpace: 'Back to space',
    color: 'Color',
    deleteConfirm: 'Delete this space?',
    deleteSpace: 'Delete space',
    editSpace: 'Edit space',
    key: 'Key',
    loadError: 'Could not load space',
    loading: 'Loading space…',
    name: 'Name',
    saveChanges: 'Save changes',
    saving: 'Saving…',
    settings: 'settings',
  },
  ru: {
    backToSpace: 'Назад к разделу',
    color: 'Цвет',
    deleteConfirm: 'Удалить этот раздел?',
    deleteSpace: 'Удалить раздел',
    editSpace: 'Изменить раздел',
    key: 'Ключ',
    loadError: 'Не удалось загрузить раздел',
    loading: 'Загрузка раздела…',
    name: 'Название',
    saveChanges: 'Сохранить изменения',
    saving: 'Сохранение…',
    settings: 'настройки',
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

useHead({
  title: computed(() => (data.value ? `${data.value.name} ${t('settings')}` : t('editSpace'))),
})

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
  if (confirm(t('deleteConfirm')) && (await removeSpace({ spaceKey: props.spaceKey }))) {
    await props.onDeleted()
  }
}
</script>
