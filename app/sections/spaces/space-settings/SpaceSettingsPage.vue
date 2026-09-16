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

const { data, message, pending, refresh } = await useQuery(
  () => `space-settings:${props.spaceKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ signal, spaceKey: props.spaceKey }),
  { watch: [() => props.spaceKey] },
)

watch(
  data,
  (value) => {
    if (!value) {
      return
    }
    form.color = value.color
    form.key = value.spaceKey
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
} = useAction(props.deps.update)

const update = async (): Promise<void> => {
  const page = data.value
  if (!page || removing.value) {
    return
  }
  const key = form.key.trim()
  const updated = await updateSpace({
    color: form.color,
    name: form.name,
    newKey: key,
    oldKey: page.spaceKey,
  })
  if (updated) {
    await props.onUpdated(key)
  }
}

const {
  execute: removeSpace,
  message: removeMessage,
  pending: removing,
} = useAction(props.deps.remove, {
  onSuccess: props.onDeleted,
})

const submitting = computed(() => updating.value || removing.value)

const remove = async (): Promise<void> => {
  const page = data.value
  if (!page || submitting.value || !confirm(t('deleteConfirm'))) {
    return
  }
  void removeSpace({ spaceKey: page.spaceKey })
}
</script>
