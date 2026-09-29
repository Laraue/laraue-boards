<template>
  <section class="org-picker">
    <div class="picker-card form-page">
      <NuxtLink
        class="logo"
        to="/organizations">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </NuxtLink>
      <div class="page-heading">
        <AppBackLink
          :label="t('backToOrganizations')"
          to="/organizations" />
        <div class="page-heading-text">
          <h1>{{ t('createOrganization') }}</h1>
        </div>
      </div>
      <p class="muted">{{ t('createDescription') }}</p>
      <form @submit.prevent="submit({ color: form.color, name: form.name, slug: form.slug })">
        <label for="create-organization-name">{{ t('name') }}</label>
        <input
          id="create-organization-name"
          v-model="form.name"
          required />
        <label for="create-organization-slug">{{ t('slug') }}</label>
        <input
          id="create-organization-slug"
          v-model="form.slug"
          pattern="[a-z0-9-]+"
          :placeholder="t('slugPlaceholder')"
          required />
        <label>{{ t('color') }}</label>
        <AppColorPicker v-model="form.color" />
        <p
          v-if="message"
          class="form-error">
          {{ message }}
        </p>
        <div class="form-actions">
          <button
            class="primary"
            :disabled="pending">
            {{ pending ? t('creating') : t('createOrganization') }}
          </button>
          <NuxtLink
            class="secondary"
            to="/organizations">
            {{ t('cancel') }}
          </NuxtLink>
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
    cancel: 'Cancel',
    color: 'Color',
    createDescription: 'Create a new workspace for your team.',
    createOrganization: 'Create organization',
    creating: 'Creating…',
    name: 'Name',
    slug: 'Slug',
    slugPlaceholder: 'acme-studio',
  },
  ru: {
    backToOrganizations: 'Назад к организациям',
    cancel: 'Отмена',
    color: 'Цвет',
    createDescription: 'Создайте новое рабочее пространство для своей команды.',
    createOrganization: 'Создать организацию',
    creating: 'Создание…',
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

const {
  execute: submit,
  message,
  pending,
} = useAction(props.deps.create, {
  onSuccess: props.onCreated,
})
</script>

<style scoped>
.org-picker {
  display: grid;
  min-height: 100dvh;
  padding: var(--space-6);
  place-items: center;
}

.picker-card {
  width: min(var(--form-page-max-width), 100%);
}

.picker-card > .logo {
  margin-bottom: 48px;
}
</style>
