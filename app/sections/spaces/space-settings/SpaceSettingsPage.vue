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
        :title="t('settings')">
        <template
          v-if="data"
          #actions>
          <DeleteActionMenu
            v-if="data.canDelete"
            :disabled="submitting"
            :label="t('deleteSpace')"
            :loading="removing"
            :on-delete="remove" />
          <BaseButton
            v-if="data.canUpdate"
            :aria-label="t('saveChanges')"
            :disabled="removing"
            :form="formId"
            icon-on-mobile
            :loading="updating"
            type="submit"
            variant="primary">
            <IconCheck />
            <template #label>{{ t('saveChanges') }}</template>
          </BaseButton>
        </template>
      </PageHeader>
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
          <form
            :id="formId"
            @submit.prevent="update">
            <div class="settings-fields">
              <label
                class="field-label"
                for="space-settings-name">
                {{ t('name') }}
              </label>
              <BaseInput
                id="space-settings-name"
                v-model="form.name"
                :disabled="!page.canUpdate || submitting"
                required />
              <label
                class="field-label"
                for="space-settings-key">
                {{ t('key') }}
              </label>
              <BaseInput
                id="space-settings-key"
                v-model="form.key"
                :disabled="!page.canUpdate || submitting"
                required />
              <span
                :id="`${formId}-color`"
                class="field-label">
                {{ t('color') }}
              </span>
              <AppColorPicker
                v-model="form.color"
                :aria-labelledby="`${formId}-color`"
                :disabled="!page.canUpdate || submitting" />
            </div>
            <p
              v-if="updateMessage || removeMessage"
              class="form-error">
              {{ updateMessage || removeMessage }}
            </p>
          </form>
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import { IconCheck, IconSettings } from '@tabler/icons-vue'

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
    deleteSpace: 'Delete space',
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
    deleteSpace: 'Удалить раздел',
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
const formId = `space-settings-${useId()}`

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
  margin-inline: auto;
  max-width: 768px;
  width: 100%;
}

.settings-fields {
  align-items: center;
  column-gap: var(--space-4);
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  row-gap: var(--space-3);
}

@media (max-width: 600px) {
  .settings-fields {
    column-gap: var(--space-2);
  }
}
</style>
