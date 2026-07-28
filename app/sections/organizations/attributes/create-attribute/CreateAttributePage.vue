<template>
  <section class="form-page">
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to attributes"
          :to="organizationRoutes.attributes()" />
        <Tags class="page-heading-icon" />
        <div class="page-heading-text"><h1>Create attribute</h1></div>
      </div>
    </div>
    <form
      class="attribute-editor"
      @submit.prevent="submit">
      <label for="create-attribute-name">Name</label>
      <input
        id="create-attribute-name"
        v-model="draft.name"
        maxlength="64"
        required />

      <label>Color</label>
      <AppColorPicker v-model="draft.color" />

      <label for="create-attribute-type">Type</label>
      <select
        id="create-attribute-type"
        :value="draft.data.type"
        @change="changeType">
        <option value="text">Text</option>
        <option value="list">List</option>
      </select>

      <Transition name="slide-fade">
        <fieldset v-if="draft.data.type === 'list'">
          <legend>Options</legend>
          <TransitionGroup
            name="list"
            tag="div">
            <div
              v-for="(option, index) in draft.data.listValues"
              :key="option.key"
              class="attribute-option">
              <input
                v-model="option.name"
                :aria-label="`Option ${index + 1}`"
                maxlength="64"
                required />
              <button
                :aria-label="`Remove option ${index + 1}`"
                class="icon-btn danger"
                :disabled="draft.data.listValues.length === 1"
                type="button"
                @click="draft.data.listValues.splice(index, 1)">
                <Trash2 />
              </button>
            </div>
          </TransitionGroup>
          <button
            class="secondary add-option"
            type="button"
            @click="addOption">
            <Plus />
            Add option
          </button>
        </fieldset>
      </Transition>

      <p
        v-if="message"
        class="form-error">
        {{ message }}
      </p>
      <div class="form-actions">
        <button
          class="primary"
          :disabled="pending">
          {{ pending ? 'Creating…' : 'Create attribute' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { Plus, Tags, Trash2 } from '@lucide/vue'

import { DEFAULT_COLOR } from '~/constants/colors'
import type { CreateAttributePageDeps } from '~/sections/organizations/attributes/create-attribute/CreateAttributePage.deps'
import type { AttributeDraft } from '~/sections/organizations/attributes/create-attribute/CreateAttributePage.types'

const props = defineProps<{
  deps: CreateAttributePageDeps
  onCreated: () => Promise<void> | void
}>()

const organizationRoutes = useOrganizationRoutes()

useHead({ title: 'Create attribute' })

const {
  execute: create,
  message,
  pending,
} = useAction(props.deps.create, {
  onSuccess: props.onCreated,
})

let nextOptionKey = 0

const draft = reactive<AttributeDraft>({
  color: DEFAULT_COLOR,
  data: { type: 'text' },
  name: '',
})

const addOption = () => {
  if (draft.data.type === 'list') {
    draft.data.listValues.push({ key: nextOptionKey++, name: '' })
  }
}

const changeType = (event: Event) => {
  const type = (event.target as HTMLSelectElement).value
  switch (type) {
    case 'list':
      draft.data = { listValues: [{ key: nextOptionKey++, name: '' }], type }
      break
    case 'text':
      draft.data = { type }
      break
  }
}

const submit = () => {
  const value = draft
  void create(
    value.data.type === 'list'
      ? {
          color: value.color,
          data: {
            listValues: value.data.listValues.map((option) => option.name),
            type: value.data.type,
          },
          name: value.name,
        }
      : {
          color: value.color,
          data: { type: value.data.type },
          name: value.name,
        },
  )
}
</script>

<style scoped>
.attribute-editor fieldset {
  border: 0;
  margin: var(--space-5) 0 0;
  padding: 0;
}

.attribute-editor legend {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-2);
}

.attribute-option {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: minmax(0, 1fr) auto;
  margin-bottom: var(--space-2);
}

.add-option {
  margin-top: var(--space-2);
}
</style>
