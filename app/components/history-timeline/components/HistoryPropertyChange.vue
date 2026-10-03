<template>
  <span>{{ change.label }}:</span>
  <div class="history-value-change">
    <span :title="display(change.oldValue)">
      <AttributeIcon
        v-if="change.oldColor"
        :style="{ color: change.oldColor }" />
      {{ display(change.oldValue) }}
    </span>
    <IconArrowRight />
    <span
      class="history-new-value"
      :title="display(change.newValue)">
      <AttributeIcon
        v-if="change.newColor"
        :style="{ color: change.newColor }" />
      {{ display(change.newValue) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'

import { AttributeIcon } from '~/constants/icons'

import type { HistoryPropertyChangeViewModel } from '../HistoryTimeline.types'

const props = defineProps<{ change: HistoryPropertyChangeViewModel }>()

const { t } = useI18n({
  en: { none: 'None' },
  ru: { none: 'Нет' },
})

const { formatDate, formatDateTime } = useFormatters()

const display = (value: null | string) => {
  if (value === null) {
    return t('none')
  }

  const date = new Date(value)

  if (!props.change.format || Number.isNaN(date.getTime())) {
    return value
  }

  return props.change.format === 'dateTime' ? formatDateTime(date) : formatDate(date)
}
</script>
