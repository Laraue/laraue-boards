<template>
  <section class="form-page">
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          :label="t('backToAttributes')"
          :to="organizationRoutes.attributes()" />
        <div class="page-heading-text">
          <h2>{{ t('createAttribute') }}</h2>
        </div>
      </div>
    </div>
    <form
      class="attribute-editor"
      @submit.prevent="submit">
      <label for="create-attribute-name">{{ t('name') }}</label>
      <input
        id="create-attribute-name"
        v-model="draft.name"
        maxlength="64"
        required />

      <label>{{ t('color') }}</label>
      <AppColorPicker v-model="draft.color" />

      <label for="create-attribute-type">{{ t('type') }}</label>
      <select
        id="create-attribute-type"
        :value="draft.data.type"
        @change="changeType">
        <option value="text">{{ t('text') }}</option>
        <option value="list">{{ t('list') }}</option>
        <option value="integer">{{ t('integer') }}</option>
        <option value="decimal">{{ t('decimal') }}</option>
        <option value="date">{{ t('date') }}</option>
        <option value="dateTime">{{ t('dateTime') }}</option>
      </select>

      <Transition name="slide-fade">
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
                <Trash2 />
              </button>
            </div>
          </TransitionGroup>
          <button
            class="secondary add-option"
            type="button"
            @click="addOption">
            <Plus />
            {{ t('addOption') }}
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
          {{ pending ? t('creating') : t('createAttribute') }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { Plus, Trash2 } from '@lucide/vue'

import { DEFAULT_COLOR } from '~/constants/colors'
import type {
  AttributeDraft,
  CreateAttributeInput,
  CreateAttributePageDeps,
} from '~/sections/organizations/attributes/create-attribute/CreateAttributePage.deps'
import { assertNever } from '~/utils/assertNever'

const props = defineProps<{
  deps: CreateAttributePageDeps
  onCreated: () => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    addOption: 'Add option',
    backToAttributes: 'Back to attributes',
    color: 'Color',
    createAttribute: 'Create attribute',
    creating: 'Creating…',
    date: 'Date',
    dateTime: 'Date and time',
    decimal: 'Decimal',
    integer: 'Integer',
    list: 'List',
    name: 'Name',
    option: 'Option',
    options: 'Options',
    removeOption: 'Remove option',
    text: 'Text',
    type: 'Type',
  },
  ru: {
    addOption: 'Добавить вариант',
    backToAttributes: 'Назад к атрибутам',
    color: 'Цвет',
    createAttribute: 'Создать атрибут',
    creating: 'Создание…',
    date: 'Дата',
    dateTime: 'Дата и время',
    decimal: 'Десятичное число',
    integer: 'Целое число',
    list: 'Список',
    name: 'Название',
    option: 'Вариант',
    options: 'Варианты',
    removeOption: 'Удалить вариант',
    text: 'Текст',
    type: 'Тип',
  },
})

const organizationRoutes = useOrganizationRoutes()

useHead({ title: t('createAttribute') })

const { execute: create, message, pending } = useApiAction(props.deps.create)

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
  const type = (event.target as HTMLSelectElement).value as AttributeDraft['data']['type']
  switch (type) {
    case 'text':
      draft.data = { type: 'text' }
      break
    case 'list':
      draft.data = { listValues: [{ key: nextOptionKey++, name: '' }], type: 'list' }
      break
    case 'integer':
      draft.data = { type: 'integer' }
      break
    case 'decimal':
      draft.data = { type: 'decimal' }
      break
    case 'date':
      draft.data = { type: 'date' }
      break
    case 'dateTime':
      draft.data = { type: 'dateTime' }
      break
    default:
      assertNever(type)
  }
}

const toInput = ({ color, data, name }: AttributeDraft): CreateAttributeInput => {
  switch (data.type) {
    case 'list':
      return {
        color,
        data: { listValues: data.listValues.map((option) => option.name), type: 'list' },
        name,
      }
    case 'text':
    case 'integer':
    case 'decimal':
    case 'date':
    case 'dateTime':
      return { color, data: { type: data.type }, name }
    default:
      return assertNever(data)
  }
}

const submit = async () => {
  if (await create(toInput(draft))) {
    await props.onCreated()
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
