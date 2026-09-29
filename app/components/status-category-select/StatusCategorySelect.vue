<template>
  <select
    v-model="model"
    :aria-label="t('category')"
    :disabled="disabled">
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import type { StatusCategory } from './StatusCategorySelect.types'

defineProps<{ disabled?: boolean }>()
const model = defineModel<StatusCategory>({ required: true })

const { t } = useI18n({
  en: {
    category: 'Status category',
    completed: 'Done',
    created: 'Not started',
    inProgress: 'In progress',
  },
  ru: {
    category: 'Категория статуса',
    completed: 'Готово',
    created: 'Не начато',
    inProgress: 'В работе',
  },
})

const options = computed(
  () =>
    [
      { label: t('created'), value: 'Created' },
      { label: t('inProgress'), value: 'InProgress' },
      { label: t('completed'), value: 'Completed' },
    ] as const satisfies ReadonlyArray<{ label: string; value: StatusCategory }>,
)
</script>
