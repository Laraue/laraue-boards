<template>
  <QueryState
    :data="data"
    error-title="Could not load space"
    loading-text="Loading space…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="form-page">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to space"
              :to="organizationRoutes.space(spaceKey)" />
            <SpaceIcon
              class="page-heading-icon"
              :style="{ color: form.color }" />
            <div class="page-heading-text"><h1>Edit space</h1></div>
          </div>
        </div>
        <form @submit.prevent="update">
          <label for="space-settings-name">Name</label>
          <input
            id="space-settings-name"
            v-model="form.name"
            :disabled="!page.canUpdate"
            required />
          <label for="space-settings-key">Key</label>
          <input
            id="space-settings-key"
            v-model="form.key"
            :disabled="!page.canUpdate"
            required />
          <label>Color</label>
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
              {{ updating ? 'Saving…' : 'Save changes' }}
            </button>
            <button
              v-if="page.canDelete"
              class="secondary danger"
              :disabled="submitting"
              type="button"
              @click="remove">
              Delete space
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
  title: computed(() => (data.value ? `${data.value.name} settings` : 'Space settings')),
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
  if (!page || submitting.value || !confirm('Delete this space?')) {
    return
  }
  void removeSpace({ spaceKey: page.spaceKey })
}
</script>
