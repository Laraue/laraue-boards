<template>
  <section class="form-page">
    <div class="page-heading">
      <SpaceIcon
        class="page-heading-icon"
        :style="{ color: form.color }" />
      <div class="page-heading-text">
        <h1>{{ t('createSpace') }}</h1>
      </div>
    </div>
    <form @submit.prevent="submit({ color: form.color, key: form.key.trim(), name: form.name })">
      <label for="create-space-name">{{ t('name') }}</label>
      <input
        id="create-space-name"
        v-model="form.name"
        required />
      <label for="create-space-key">{{ t('key') }}</label>
      <input
        id="create-space-key"
        v-model="form.key"
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
          {{ pending ? t('creating') : t('createSpace') }}
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

const { t } = useI18n({
  en: {
    color: 'Color',
    createSpace: 'Create space',
    creating: 'Creating…',
    key: 'Key',
    name: 'Name',
  },
  ru: {
    color: 'Цвет',
    createSpace: 'Создать раздел',
    creating: 'Создание…',
    key: 'Ключ',
    name: 'Название',
  },
})

const form = reactive({
  color: DEFAULT_COLOR,
  key: '',
  name: '',
})

useHead(() => ({ title: t('createSpace') }))

const {
  execute: submit,
  message,
  pending,
} = useAction(props.deps.create, {
  onSuccess: (space) => props.onCreated(space.spaceKey),
})
</script>
