<template>
  <span>{{ change.label }}:</span>
  <div class="history-value-change">
    <span :title="display(change.oldValue)">
      <i
        v-if="change.oldColor"
        :style="{ background: change.oldColor }" />
      {{ display(change.oldValue) }}
    </span>
    <ArrowRight />
    <span
      class="history-new-value"
      :title="display(change.newValue)">
      <i
        v-if="change.newColor"
        :style="{ background: change.newColor }" />
      {{ display(change.newValue) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import type { HistoryPropertyChangeViewModel } from '../HistoryTimeline.types'

const props = defineProps<{ change: HistoryPropertyChangeViewModel }>()

const { locale, t } = useI18n({
  en: { none: 'None' },
  ru: { none: 'Нет' },
})

const dateFormatter = props.change.format
  ? new Intl.DateTimeFormat(locale.value, {
      dateStyle: 'medium',
      ...(props.change.format === 'dateTime' ? { timeStyle: 'short' } : {}),
      timeZone: 'UTC',
    })
  : null

const display = (value: null | string) => {
  if (value === null) {
    return t('none')
  }

  const date = new Date(value)

  return dateFormatter && !Number.isNaN(date.getTime()) ? dateFormatter.format(date) : value
}
</script>
