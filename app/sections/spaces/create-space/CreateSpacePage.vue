<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="SpaceIcon"
        :icon-color="form.color"
        :title="t('createSpace')" />
    </template>
    <section class="create-space-page">
      <form
        class="create-space-form"
        @submit.prevent="submit">
        <BaseFieldGroup>
          <BaseField
            id="create-space-name"
            :label="t('name')">
            <BaseInput
              id="create-space-name"
              v-model="form.name"
              :disabled="pending"
              required />
          </BaseField>
          <BaseField
            id="create-space-key"
            :label="t('key')">
            <BaseInput
              id="create-space-key"
              v-model="form.key"
              :disabled="pending"
              required />
          </BaseField>
          <BaseField
            v-slot="{ labelId }"
            :label="t('color')">
            <AppColorPicker
              v-model="form.color"
              :aria-labelledby="labelId"
              :disabled="pending" />
          </BaseField>
        </BaseFieldGroup>
        <p
          v-if="message"
          class="form-error">
          {{ message }}
        </p>
        <div class="form-actions">
          <BaseButton
            :loading="pending"
            type="submit"
            variant="primary">
            {{ t('createSpace') }}
          </BaseButton>
        </div>
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

.create-space-form {
  display: grid;
  gap: var(--space-5);
}
</style>
