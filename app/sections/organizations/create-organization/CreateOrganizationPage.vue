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
          label="Back to organizations"
          to="/organizations" />
        <div class="page-heading-text">
          <h1>Create organization</h1>
        </div>
      </div>
      <p class="muted">Create a new workspace for your team.</p>
      <form @submit.prevent="submit({ color: form.color, name: form.name, slug: form.slug })">
        <label for="create-organization-name">Name</label>
        <input
          id="create-organization-name"
          v-model="form.name"
          required />
        <label for="create-organization-slug">Slug</label>
        <input
          id="create-organization-slug"
          v-model="form.slug"
          pattern="[a-z0-9-]+"
          placeholder="acme-studio"
          required />
        <label>Color</label>
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
            {{ pending ? 'Creating…' : 'Create organization' }}
          </button>
          <NuxtLink
            class="secondary"
            to="/organizations">
            Cancel
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

const form = reactive({
  color: DEFAULT_COLOR,
  name: '',
  slug: '',
})

useHead({ title: 'Create organization' })

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
  min-height: 100vh;
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
