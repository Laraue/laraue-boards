<template>
  <QueryState
    :data="data"
    error-title="Could not load attribute"
    loading-text="Loading attribute…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: attribute }">
      <section class="form-page">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to attributes"
              :to="organizationRoutes.attributes()" />
            <Tags class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>Edit attribute</h1>
            </div>
          </div>
        </div>
        <form
          v-if="draft"
          class="attribute-editor"
          @submit.prevent="submit">
          <label for="edit-attribute-name">Name</label>
          <input
            id="edit-attribute-name"
            v-model="draft.name"
            maxlength="64"
            required />

          <label>Color</label>
          <AppColorPicker v-model="draft.color" />

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

          <p
            v-if="updateMessage || deleteMessage"
            class="form-error">
            {{ updateMessage || deleteMessage }}
          </p>
          <div class="form-actions">
            <button
              class="primary"
              :disabled="submitting">
              {{ submitting ? 'Saving…' : 'Save changes' }}
            </button>
            <button
              class="secondary danger"
              :disabled="submitting"
              type="button"
              @click="remove(attribute)">
              <Trash2 />
              Delete attribute
            </button>
          </div>
        </form>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { Plus, Tags, Trash2 } from '@lucide/vue'

import type { AttributePageDeps } from '~/sections/organizations/attributes/attribute/AttributePage.deps'
import type {
  Attribute,
  AttributeDraft,
} from '~/sections/organizations/attributes/attribute/AttributePage.types'
import { assertNever } from '~/utils/assertNever'

const props = defineProps<{
  attributeId: string
  deps: AttributePageDeps
  onFinished: () => Promise<void> | void
}>()

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useQuery(
  () => `attribute:${props.attributeId}`,
  (_nuxtApp, { signal }) => props.deps.view({ attributeId: props.attributeId, signal }),
  { watch: [() => props.attributeId] },
)

useHead({
  title: computed(() => (data.value ? `${data.value.name} attribute` : 'Attribute')),
})

const {
  execute: update,
  message: updateMessage,
  pending: updating,
} = useAction(props.deps.update, {
  onSuccess: props.onFinished,
})

const {
  execute: deleteAttribute,
  message: deleteMessage,
  pending: deleting,
} = useAction(props.deps.delete, {
  onSuccess: props.onFinished,
})

const submitting = computed(() => updating.value || deleting.value)

let nextOptionKey = 0

const toDraft = (attribute: Attribute): AttributeDraft => {
  const base = { color: attribute.color, id: attribute.id, name: attribute.name }
  switch (attribute.data.type) {
    case 'text':
      return { ...base, data: { type: 'text' } }
    case 'list':
      return {
        ...base,
        data: {
          listValues:
            attribute.data.listValues.length > 0
              ? attribute.data.listValues.map((option) => ({
                  id: option.id,
                  key: nextOptionKey++,
                  name: option.name,
                }))
              : [{ id: null, key: nextOptionKey++, name: '' }],
          type: 'list',
        },
      }
    case 'integer':
      return { ...base, data: { type: 'integer' } }
    case 'decimal':
      return { ...base, data: { type: 'decimal' } }
    case 'date':
      return { ...base, data: { type: 'date' } }
    case 'dateTime':
      return { ...base, data: { type: 'dateTime' } }
    default:
      return assertNever(attribute.data)
  }
}

const draft = ref<AttributeDraft | undefined>(data.value ? toDraft(data.value) : undefined)

watch(data, (attribute) => {
  draft.value = attribute ? toDraft(attribute) : undefined
})

const addOption = () => {
  if (draft.value?.data.type === 'list') {
    draft.value.data.listValues.push({ id: null, key: nextOptionKey++, name: '' })
  }
}

const submit = () => {
  const value = draft.value
  if (!value) {
    return
  }
  const base = { color: value.color, id: value.id, name: value.name }
  switch (value.data.type) {
    case 'text':
      void update({ ...base, data: { type: 'text' } })
      break
    case 'list':
      void update({
        ...base,
        data: {
          listValues: value.data.listValues.map((option) => ({
            id: option.id,
            name: option.name,
          })),
          type: 'list',
        },
      })
      break
    case 'integer':
      void update({ ...base, data: { type: 'integer' } })
      break
    case 'decimal':
      void update({ ...base, data: { type: 'decimal' } })
      break
    case 'date':
      void update({ ...base, data: { type: 'date' } })
      break
    case 'dateTime':
      void update({ ...base, data: { type: 'dateTime' } })
      break
    default:
      assertNever(value.data)
  }
}

const remove = (attribute: Attribute) => {
  if (submitting.value) {
    return
  }
  if (confirm(`Delete attribute "${attribute.name}"?`)) {
    void deleteAttribute({ id: attribute.id })
  }
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
