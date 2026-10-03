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
        <form
          @submit.prevent="
            submitForm({
              id: page.id,
              name: state.name,
              color: state.color,
              slug: page.slug,
            })
          ">
          <label for="organization-settings-name">{{ t('name') }}</label>
          <input
            id="organization-settings-name"
            v-model="state.name"
            :disabled="!page.canUpdate"
            required />
          <label>{{ t('color') }}</label>
          <AppColorPicker
            v-model="state.color"
            :disabled="!page.canUpdate" />
          <p
            v-if="state.saved"
            class="form-success">
            {{ t('changesSaved') }}
          </p>
          <p
            v-if="submitMessage || removeMessage"
            class="form-error">
            {{ submitMessage || removeMessage }}
          </p>
          <div class="form-actions">
            <button
              v-if="page.canUpdate"
              class="primary"
              :disabled="busy">
              {{ submitting ? t('saving') : t('saveChanges') }}
            </button>
            <button
              v-if="page.canDelete"
              class="secondary danger"
              :disabled="busy"
              type="button"
              @click="remove(page.id)">
              {{ removing ? t('deleting') : t('deleteOrganization') }}
            </button>
          </div>
        </form>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import type {
  OrganizationSettingsPageDeps,
  UpdateOrganizationInput,
} from '~/sections/organizations/admin/OrganizationSettingsPage.deps'

const props = defineProps<{
  deps: OrganizationSettingsPageDeps
  onDeleted: () => Promise<void> | void
  onUpdated: () => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    changesSaved: 'Changes saved.',
    color: 'Color',
    deleteConfirm: 'Delete this organization?',
    deleteOrganization: 'Delete organization',
    deleting: 'Deleting…',
    generalSettings: 'General settings',
    loadError: 'Could not load settings',
    loading: 'Loading settings…',
    name: 'Name',
    saveChanges: 'Save changes',
    saving: 'Saving…',
    settings: 'settings',
  },
  ru: {
    changesSaved: 'Изменения сохранены.',
    color: 'Цвет',
    deleteConfirm: 'Удалить эту организацию?',
    deleteOrganization: 'Удалить организацию',
    deleting: 'Удаление…',
    generalSettings: 'Общие настройки',
    loadError: 'Не удалось загрузить настройки',
    loading: 'Загрузка настроек…',
    name: 'Название',
    saveChanges: 'Сохранить изменения',
    saving: 'Сохранение…',
    settings: 'настройки',
  },
})

const { data, message, pending, refresh } = await useApiQuery('organization-settings', (signal) =>
  props.deps.view({ signal }),
)

const state = reactive({ color: '', name: '', saved: false })

watch(
  data,
  (settings) => {
    state.color = settings?.color ?? ''
    state.name = settings?.name ?? ''
  },
  { immediate: true },
)

usePageTitle(computed(() => (state.name ? `${state.name} ${t('settings')}` : t('generalSettings'))))

const {
  execute: submit,
  message: submitMessage,
  pending: submitting,
} = useApiAction(props.deps.updateOrganization)

const submitForm = async (input: UpdateOrganizationInput): Promise<void> => {
  state.saved = false
  if (await submit(input)) {
    await props.onUpdated()
    state.saved = true
  }
}

const {
  execute: removeOrganization,
  message: removeMessage,
  pending: removing,
} = useApiAction(props.deps.remove)
const busy = computed(() => submitting.value || removing.value)
const remove = async (id: string): Promise<void> => {
  if (confirm(t('deleteConfirm')) && (await removeOrganization({ id }))) {
    await props.onDeleted()
  }
}
</script>
