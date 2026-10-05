<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="SpaceIcon"
        :icon-color="form.color"
        :title="t('createSpace')">
        <template #actions>
          <BaseButton
            :aria-label="t('createSpace')"
            :form="formId"
            icon-on-mobile
            :loading="pending"
            type="submit"
            variant="primary">
            <SpaceIcon />
            <template #label>{{ t('createSpace') }}</template>
          </BaseButton>
        </template>
      </PageHeader>
    </template>
    <section class="create-space-page">
      <form
        :id="formId"
        @submit.prevent="submit">
        <div class="settings-fields">
          <label for="create-space-name">{{ t('name') }}</label>
          <BaseInput
            id="create-space-name"
            v-model="form.name"
            :disabled="pending"
            required />
          <label for="create-space-key">{{ t('key') }}</label>
          <BaseInput
            id="create-space-key"
            v-model="form.key"
            :disabled="pending"
            required />
          <span :id="`${formId}-color`">{{ t('color') }}</span>
          <AppColorPicker
            v-model="form.color"
            :aria-labelledby="`${formId}-color`"
            :disabled="pending" />
        </div>
        <p
          v-if="message"
          class="form-error">
          {{ message }}
        </p>
      </form>
    </section>
  </AppPage>
</template>

<script setup lang="ts">
import { DEFAULT_COLOR } from '~/constants/colors'
import { SpaceIcon } from '~/constants/icons'
import type { CreateSpacePageDeps } from '~/sections/spaces/create-space/CreateSpacePage.deps'

const props = defineProps<{
  deps: CreateSpacePageDeps
  onCreated: (spaceKey: string) => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    color: 'Color',
    createSpace: 'Create space',
    key: 'Key',
    name: 'Name',
  },
  ru: {
    color: 'Цвет',
    createSpace: 'Создать раздел',
    key: 'Ключ',
    name: 'Название',
  },
})

const form = reactive({
  color: DEFAULT_COLOR,
  key: '',
  name: '',
})
const formId = `create-space-${useId()}`

const { execute: create, message, pending } = useApiAction(props.deps.create)

const submit = async (): Promise<void> => {
  const created = await create({ color: form.color, key: form.key.trim(), name: form.name })
  if (created) {
    await props.onCreated(created.value)
  }
}
</script>

<style scoped>
.create-space-page {
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
