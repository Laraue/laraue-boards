<template>
  <section class="org-picker">
    <div class="picker-card">
      <BaseSectionHeader
        :description="t('createDescription')"
        :title="t('createOrganization')">
        <template #leading>
          <AppBackLink
            :label="t('backToOrganizations')"
            to="/organizations" />
        </template>
      </BaseSectionHeader>
      <form
        class="create-organization-form"
        @submit.prevent="submit">
        <BaseFieldGroup>
          <BaseField
            id="create-organization-name"
            :label="t('name')">
            <input
              id="create-organization-name"
              v-model="form.name"
              required />
          </BaseField>
          <BaseField
            id="create-organization-slug"
            :label="t('slug')">
            <input
              id="create-organization-slug"
              v-model="form.slug"
              pattern="[a-z0-9-]+"
              :placeholder="t('slugPlaceholder')"
              required />
          </BaseField>
          <BaseField
            v-slot="{ labelId }"
            :label="t('color')">
            <AppColorPicker
              v-model="form.color"
              :aria-labelledby="labelId" />
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
            {{ t('createOrganization') }}
          </BaseButton>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DEFAULT_COLOR } from '~/constants/colors'
import type { CreateOrganizationPageDeps } from '~/sections/organizations/create-organization/CreateOrganizationPage.deps'

const props = defineProps<{
  deps: CreateOrganizationPageDeps
  onCreated: () => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    backToOrganizations: 'Back to organizations',
    color: 'Color',
    createDescription: 'Create a new workspace for your team.',
    createOrganization: 'Create organization',
    name: 'Name',
    slug: 'Slug',
    slugPlaceholder: 'acme-studio',
  },
  ru: {
    backToOrganizations: 'Назад к организациям',
    color: 'Цвет',
    createDescription: 'Создайте новое рабочее пространство для своей команды.',
    createOrganization: 'Создать организацию',
    name: 'Название',
    slug: 'Идентификатор',
    slugPlaceholder: 'acme-studio',
  },
})

const form = reactive({
  color: DEFAULT_COLOR,
  name: '',
  slug: '',
})

useHead({ title: t('createOrganization') })

const { execute: create, message, pending } = useApiAction(props.deps.create)

const submit = async (): Promise<void> => {
  if (await create({ ...form })) {
    await props.onCreated()
  }
}
</script>

<style scoped>
.org-picker {
  display: grid;
  justify-items: center;
  padding: var(--space-8) var(--space-4);
}

.picker-card {
  width: min(var(--form-page-max-width), 100%);
}

.create-organization-form {
  display: grid;
  gap: var(--space-5);
  margin-top: var(--space-6);
}
</style>
