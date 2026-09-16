<template>
  <span>{{ change.label }}:</span>
  <div class="history-value-change">
    <span :title="displayValue(change.oldValue)">
      <span
        v-if="change.oldValue !== 'None'"
        class="avatar"
        :style="{ background: change.oldColor ?? 'var(--color-border)' }">
        {{ initials(change.oldValue) }}
      </span>
      <i
        v-else-if="change.oldColor"
        :style="{ background: change.oldColor }" />
      {{ displayValue(change.oldValue) }}
    </span>
    <ArrowRight />
    <span
      class="history-new-value"
      :title="displayValue(change.newValue)">
      <span
        v-if="change.newValue !== 'None'"
        class="avatar"
        :style="{ background: change.newColor ?? 'var(--color-border)' }">
        {{ initials(change.newValue) }}
      </span>
      <i
        v-else-if="change.newColor"
        :style="{ background: change.newColor }" />
      {{ displayValue(change.newValue) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import type { HistoryAssigneeChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryAssigneeChangeViewModel }>()

const { t } = useI18n({
  en: { none: 'None' },
  ru: { none: 'Нет' },
})

const displayValue = (value: string) => (value === 'None' ? t('none') : value)

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
</script>
