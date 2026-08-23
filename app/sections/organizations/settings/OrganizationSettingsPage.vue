<template>
  <QueryState
    :data="data"
    error-title="Could not load settings"
    loading-text="Loading settings…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="form-page">
        <div class="title-row">
          <div class="page-heading">
            <Settings class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>General settings</h1>
            </div>
          </div>
        </div>
        <form
          @submit.prevent="
            submitForm({
              id: page.id,
              name: state.name,
              color: state.color,
              slug: page.slug,
            })
          ">
          <label for="organization-settings-name">Name</label>
          <input
            id="organization-settings-name"
            v-model="state.name"
            :disabled="!page.canUpdate"
            required />
          <label>Color</label>
          <AppColorPicker
            v-model="state.color"
            :disabled="!page.canUpdate" />
          <p
            v-if="state.saved"
            class="form-success">
            Changes saved.
          </p>
          <p
            v-if="submitMessage || leaveMessage || removeMessage"
            class="form-error">
            {{ submitMessage || leaveMessage || removeMessage }}
          </p>
          <div class="form-actions">
            <button
              v-if="page.canUpdate"
              class="primary"
              :disabled="busy">
              {{ submitting ? 'Saving…' : 'Save changes' }}
            </button>
            <button
              v-if="page.canLeave"
              class="secondary danger"
              :disabled="busy"
              type="button"
              @click="leave(page.id)">
              {{ leaving ? 'Leaving…' : 'Leave organization' }}
            </button>
            <button
              v-if="page.canDelete"
              class="secondary danger"
              :disabled="busy"
              type="button"
              @click="remove(page.id)">
              {{ removing ? 'Deleting…' : 'Delete organization' }}
            </button>
          </div>
        </form>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { Settings } from '@lucide/vue'

import type { OrganizationSettingsPageDeps } from '~/sections/organizations/settings/OrganizationSettingsPage.deps'
import type { UpdateOrganizationInput } from '~/sections/organizations/settings/OrganizationSettingsPage.types'

const props = defineProps<{
  deps: OrganizationSettingsPageDeps
  onDeleted: () => Promise<void> | void
  onLeft: () => Promise<void> | void
  onUpdated: () => Promise<void> | void
}>()

const { data, message, pending, refresh } = await useQuery(
  'organization-settings',
  (_nuxtApp, { signal }) => props.deps.view({ signal }),
)

const state = reactive({
  color: data.value?.color ?? '',
  name: data.value?.name ?? '',
  saved: false,
})

watch(data, (settings) => {
  state.color = settings?.color ?? ''
  state.name = settings?.name ?? ''
})

useHead({
  title: computed(() => (state.name ? `${state.name} settings` : 'Settings')),
})

const {
  execute: submit,
  message: submitMessage,
  pending: submitting,
} = useAction<[UpdateOrganizationInput], true>(props.deps.updateOrganization, {
  onSuccess: async () => {
    await props.onUpdated()
    state.saved = true
  },
})

const submitForm = (input: UpdateOrganizationInput): void => {
  state.saved = false
  void submit(input)
}

const {
  execute: leaveOrganization,
  message: leaveMessage,
  pending: leaving,
} = useAction(props.deps.leave, { onSuccess: props.onLeft })
const {
  execute: removeOrganization,
  message: removeMessage,
  pending: removing,
} = useAction(props.deps.remove, { onSuccess: props.onDeleted })
const busy = computed(() => submitting.value || leaving.value || removing.value)
const leave = (id: string): void => {
  if (!busy.value && confirm('Leave this organization?')) {
    void leaveOrganization({ id })
  }
}
const remove = (id: string): void => {
  if (!busy.value && confirm('Delete this organization?')) {
    void removeOrganization({ id })
  }
}
</script>

<style scoped>
.form-page > form {
  margin-top: var(--space-6);
}
</style>
