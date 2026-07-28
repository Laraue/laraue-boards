<template>
  <section class="form-page">
    <div class="page-heading">
      <SpaceIcon
        class="page-heading-icon"
        :style="{ color: form.color }" />
      <div class="page-heading-text">
        <h1>Create space</h1>
      </div>
    </div>
    <form @submit.prevent="submit({ color: form.color, key: form.key.trim(), name: form.name })">
      <label for="create-space-name">Name</label>
      <input
        id="create-space-name"
        v-model="form.name"
        required />
      <label for="create-space-key">Key</label>
      <input
        id="create-space-key"
        v-model="form.key"
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
          {{ pending ? 'Creating…' : 'Create space' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { DEFAULT_COLOR } from '~/constants/colors'
import { SpaceIcon } from '~/constants/icons'
import type { CreateSpacePageDeps } from '~/sections/spaces/create-space/CreateSpacePage.deps'

const props = defineProps<{
  deps: CreateSpacePageDeps
  onCreated: (spaceKey: string) => Promise<void> | void
}>()

const form = reactive({
  color: DEFAULT_COLOR,
  key: '',
  name: '',
})

useHead({ title: 'Create space' })

const {
  execute: submit,
  message,
  pending,
} = useAction(props.deps.create, {
  onSuccess: (space) => props.onCreated(space.spaceKey),
})
</script>
