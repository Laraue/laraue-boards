<template>
  <section class="form-page">
    <BaseSectionHeader :title="t('createAttribute')">
      <template #leading>
        <AppBackLink
          :label="t('backToAttributes')"
          :to="organizationRoutes.attributes()" />
      </template>
    </BaseSectionHeader>
    <form
      class="attribute-editor"
      @submit.prevent="submit">
      <BaseFieldGroup>
        <BaseField
          id="create-attribute-name"
          :label="t('name')">
          <input
            id="create-attribute-name"
            v-model="draft.name"
            maxlength="64"
            required />
        </BaseField>
        <BaseField
          v-slot="{ labelId }"
          :label="t('color')">
          <AppColorPicker
            v-model="draft.color"
            :aria-labelledby="labelId" />
        </BaseField>
        <BaseField
          id="create-attribute-type"
          :label="t('type')">
          <BaseSelect
            id="create-attribute-type"
            :model-value="draft.data.type"
            :options="[
              { label: t('text'), value: 'text' },
              { label: t('list'), value: 'list' },
              { label: t('integer'), value: 'integer' },
              { label: t('decimal'), value: 'decimal' },
              { label: t('date'), value: 'date' },
              { label: t('dateTime'), value: 'dateTime' },
            ]"
            @update:model-value="changeType" />
        </BaseField>
      </BaseFieldGroup>
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
              <BaseIconButton
                :disabled="draft.data.listValues.length === 1"
                :label="`${t('removeOption')} ${index + 1}`"
                variant="danger"
                @click="draft.data.listValues.splice(index, 1)">
                <IconTrash />
              </BaseIconButton>
            </div>
          </TransitionGroup>
          <BaseButton
            class="add-option"
            @click="addOption">
            <IconPlus />
            {{ t('addOption') }}
          </BaseButton>
        </fieldset>
      </Transition>

      <p
        v-if="message"
        class="form-error">
        {{ message }}
      </p>
      <div class="form-actions">
        <BaseButton
          :disabled="pending"
          type="submit"
          variant="primary">
          {{ pending ? t('creating') : t('createAttribute') }}
        </BaseButton>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { IconPlus, IconTrash } from '@tabler/icons-vue'

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

const changeType = (value: string) => {
  const type = value as AttributeDraft['data']['type']
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
.form-page {
  display: grid;
  gap: var(--space-5);
}

.attribute-editor fieldset {
  border: 0;
  margin: var(--space-5) 0 0;
  padding: 0;
}

.attribute-editor legend {
  font-weight: var(--font-weight-medium);
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
