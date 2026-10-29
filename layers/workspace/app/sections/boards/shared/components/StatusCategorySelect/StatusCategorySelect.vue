<template>
  <BaseSelect
    v-bind="$attrs"
    :aria-label="t('category')"
    :disabled="disabled"
    :model-value="model"
    :options="options"
    @update:model-value="select">
    <template #icon="{ option }">
      <StatusIndicator
        v-if="option"
        :category="option.value"
        :color="color ?? 'var(--color-muted)'" />
    </template>
  </BaseSelect>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseSelect from '#layers/core/app/ui/components/BaseSelect.vue'
import StatusIndicator from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusIndicator.vue'

import type { StatusCategory } from './StatusCategorySelect.types'

defineProps<{ color?: string; disabled?: boolean }>()
defineOptions({ inheritAttrs: false })
const model = defineModel<StatusCategory>({ required: true })

const { t } = useI18n({
  en: {
    category: 'Status category',
    completed: 'Done',
    created: 'Not started',
    inProgress: 'In progress',
    review: 'In review',
  },
  ru: {
    category: 'Категория статуса',
    completed: 'Готово',
    created: 'Не начато',
    inProgress: 'В работе',
    review: 'На проверке',
  },
})

const options = computed(
  () =>
    [
      { label: t('created'), value: 'Created' },
      { label: t('inProgress'), value: 'InProgress' },
      { label: t('review'), value: 'Review' },
      { label: t('completed'), value: 'Completed' },
    ] satisfies Array<{ label: string; value: StatusCategory }>,
)
const select = (value: string) => {
  const option = options.value.find((candidate) => candidate.value === value)
  if (option) {
    model.value = option.value
  }
}
</script>
