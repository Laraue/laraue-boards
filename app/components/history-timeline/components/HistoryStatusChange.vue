<template>
  <span>{{ t('status') }}:</span>
  <div class="history-value-change">
    <span :title="change.oldValue ?? t('none')">
      <i
        v-if="change.oldColor"
        :style="{ background: change.oldColor }" />
      {{ change.oldValue ?? t('none') }}
    </span>
    <ArrowRight />
    <span
      class="history-new-value"
      :title="change.newValue ?? t('none')">
      <i
        v-if="change.newColor"
        :style="{ background: change.newColor }" />
      {{ change.newValue ?? t('none') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import type { HistoryStatusChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryStatusChangeViewModel }>()

const { t } = useI18n({
  en: { none: 'None', status: 'Status' },
  ru: { none: 'Нет', status: 'Статус' },
})
</script>
