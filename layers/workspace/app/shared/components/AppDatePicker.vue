<template>
  <BaseDatePicker
    v-model="model"
    v-bind="props"
    :labels="labels"
    :locale="locale" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import type {
  BaseDatePickerLabels,
  BaseDatePickerProps,
} from '#layers/core/app/ui/components/BaseDatePicker.types'
import BaseDatePicker from '#layers/core/app/ui/components/BaseDatePicker.vue'

const props = defineProps<Omit<BaseDatePickerProps, 'labels' | 'locale'>>()
const model = defineModel<string>({ required: true })
const { locale, t } = useI18n({
  en: {
    chooseMonth: 'Choose month and year',
    nextMonth: 'Next month',
    nextYear: 'Next year',
    nextYears: 'Next years',
    openCalendar: 'Open calendar',
    previousMonth: 'Previous month',
    previousYear: 'Previous year',
    previousYears: 'Previous years',
  },
  ru: {
    chooseMonth: 'Выбрать месяц и год',
    nextMonth: 'Следующий месяц',
    nextYear: 'Следующий год',
    nextYears: 'Следующие годы',
    openCalendar: 'Открыть календарь',
    previousMonth: 'Предыдущий месяц',
    previousYear: 'Предыдущий год',
    previousYears: 'Предыдущие годы',
  },
})
const labels = computed<BaseDatePickerLabels>(() => ({
  chooseMonth: t('chooseMonth'),
  nextMonth: t('nextMonth'),
  nextYear: t('nextYear'),
  nextYears: t('nextYears'),
  openCalendar: t('openCalendar'),
  previousMonth: t('previousMonth'),
  previousYear: t('previousYear'),
  previousYears: t('previousYears'),
}))
</script>
