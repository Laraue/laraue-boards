<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: attribute }">
      <section class="form-page">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              :label="t('backToAttributes')"
              :to="organizationRoutes.attributes()" />
            <div class="page-heading-text">
              <h2>{{ t('editAttribute') }}</h2>
            </div>
          </div>
        </div>
        <form
          v-if="draft"
          class="attribute-editor"
          @submit.prevent="submit">
          <label for="edit-attribute-name">{{ t('name') }}</label>
          <input
            id="edit-attribute-name"
            v-model="draft.name"
            maxlength="64"
            required />

          <label>{{ t('color') }}</label>
          <AppColorPicker v-model="draft.color" />

          <fieldset v-if="draft.data.type === 'list'">
            <legend>{{ t('options') }}</legend>
            <TransitionGroup
              name="list"
              tag="div">
              <div
                v-for="(option, index) in draft.data.listValues"
                :key="option.key"
                class="attribute-option">
                <input
                  v-model="option.name"
                  :aria-label="`${t('option')} ${index + 1}`"
                  maxlength="64"
                  required />
                <button
                  :aria-label="`${t('removeOption')} ${index + 1}`"
                  class="icon-btn danger"
                  :disabled="draft.data.listValues.length === 1"
                  type="button"
                  @click="draft.data.listValues.splice(index, 1)">
                  <IconTrash />
                </button>
              </div>
            </TransitionGroup>
            <button
              class="secondary add-option"
              type="button"
              @click="addOption">
              <IconPlus />
              {{ t('addOption') }}
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
              {{ submitting ? t('saving') : t('saveChanges') }}
            </button>
            <button
              class="secondary danger"
              :disabled="submitting"
              type="button"
              @click="remove(attribute)">
              <IconTrash />
              {{ t('deleteAttribute') }}
            </button>
          </div>
        </form>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { IconPlus, IconTrash } from '@tabler/icons-vue'

import type {
  Attribute,
  AttributeDraft,
  AttributePageDeps,
  UpdateAttributeInput,
} from '~/sections/organizations/attributes/attribute/AttributePage.deps'
import { assertNever } from '~/utils/assertNever'

const props = defineProps<{
  attributeId: string
  deps: AttributePageDeps
  onFinished: () => Promise<void> | void
}>()

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    addOption: 'Add option',
    attribute: 'attribute',
    backToAttributes: 'Back to attributes',
    color: 'Color',
    deleteAttribute: 'Delete attribute',
    editAttribute: 'Edit attribute',
    loadError: 'Could not load attribute',
    loading: 'Loading attribute…',
    name: 'Name',
    option: 'Option',
    options: 'Options',
    removeOption: 'Remove option',
    saveChanges: 'Save changes',
    saving: 'Saving…',
  },
  ru: {
    addOption: 'Добавить вариант',
    attribute: 'атрибут',
    backToAttributes: 'Назад к атрибутам',
    color: 'Цвет',
    deleteAttribute: 'Удалить атрибут',
    editAttribute: 'Изменить атрибут',
    loadError: 'Не удалось загрузить атрибут',
    loading: 'Загрузка атрибута…',
    name: 'Название',
    option: 'Вариант',
    options: 'Варианты',
    removeOption: 'Удалить вариант',
    saveChanges: 'Сохранить изменения',
    saving: 'Сохранение…',
  },
})

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useApiQuery(
  () => `attribute:${props.attributeId}`,
  (signal) => props.deps.view({ attributeId: props.attributeId, signal }),
)

useHead({
  title: computed(() => (data.value ? `${data.value.name} ${t('attribute')}` : t('editAttribute'))),
})

const {
  execute: update,
  message: updateMessage,
  pending: updating,
} = useApiAction(props.deps.update)

const {
  execute: deleteAttribute,
  message: deleteMessage,
  pending: deleting,
} = useApiAction(props.deps.delete)

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

const toInput = ({
  color,
  data: attributeData,
  id,
  name,
}: AttributeDraft): UpdateAttributeInput => {
  switch (attributeData.type) {
    case 'list':
      return {
        color,
        data: {
          listValues: attributeData.listValues.map((option) => ({
            id: option.id,
            name: option.name,
          })),
          type: 'list',
        },
        id,
        name,
      }
    case 'text':
    case 'integer':
    case 'decimal':
    case 'date':
    case 'dateTime':
      return { color, data: { type: attributeData.type }, id, name }
    default:
      return assertNever(attributeData)
  }
}

const submit = async () => {
  if (draft.value && (await update(toInput(draft.value)))) {
    await props.onFinished()
  }
}

const remove = async (attribute: Attribute) => {
  if (
    (await confirm({ danger: true, title: `${t('deleteAttribute')} "${attribute.name}"?` })) &&
    (await deleteAttribute({ id: attribute.id }))
  ) {
    await props.onFinished()
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
