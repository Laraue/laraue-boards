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
        <BaseSectionHeader :title="t('general')" />
        <form
          @submit.prevent="
            submitForm({
              id: page.id,
              name: state.name,
              color: state.color,
              slug: page.slug,
            })
          ">
          <BaseFieldGroup>
            <BaseField
              id="organization-settings-name"
              :label="t('name')">
              <input
                id="organization-settings-name"
                v-model="state.name"
                :disabled="!page.canUpdate"
                required />
            </BaseField>
            <BaseField
              v-slot="{ labelId }"
              :label="t('color')">
              <AppColorPicker
                v-model="state.color"
                :aria-labelledby="labelId"
                :disabled="!page.canUpdate" />
            </BaseField>
          </BaseFieldGroup>
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
            <BaseButton
              v-if="page.canUpdate"
              :disabled="busy"
              type="submit"
              variant="primary">
              {{ submitting ? t('saving') : t('saveChanges') }}
            </BaseButton>
          </div>
        </form>
        <BaseDangerZone
          v-if="page.canDelete"
          :description="t('deleteDescription')"
          :title="t('deleteOrganization')">
          <BaseButton
            :disabled="busy"
            variant="danger"
            @click="remove(page.id)">
            {{ removing ? t('deleting') : t('deleteOrganization') }}
          </BaseButton>
        </BaseDangerZone>
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

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    changesSaved: 'Changes saved.',
    color: 'Color',
    deleteConfirm: 'Delete this organization?',
    deleteDescription:
      'Removes the organization with its spaces, boards and issues for every member.',
    deleteOrganization: 'Delete organization',
    deleting: 'Deleting…',
    general: 'General',
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
    deleteDescription:
      'Удаляет организацию со всеми пространствами, досками и задачами для всех участников.',
    deleteOrganization: 'Удалить организацию',
    deleting: 'Удаление…',
    general: 'Общие',
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

useHead({
  title: computed(() => (state.name ? `${state.name} ${t('settings')}` : t('generalSettings'))),
})

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
  if (
    (await confirm({ danger: true, title: t('deleteConfirm') })) &&
    (await removeOrganization({ id }))
  ) {
    await props.onDeleted()
  }
}
</script>

<style scoped>
.form-page {
  align-content: start;
  display: grid;
  gap: var(--space-5);
}
</style>
