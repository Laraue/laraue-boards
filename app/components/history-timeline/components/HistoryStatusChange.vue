<template>
  <span>{{ t('status') }}:</span>
  <div class="history-value-change">
    <span
      class="issue-status"
      :title="change.oldValue ?? t('none')">
      <i
        v-if="change.oldColor"
        :style="{ background: change.oldColor }" />
      {{ change.oldValue ?? t('none') }}
    </span>
    <IconArrowRight />
    <span
      class="issue-status history-new-value"
      :title="change.newValue ?? t('none')">
      <i
        v-if="change.newColor"
        :style="{ background: change.newColor }" />
      {{ change.newValue ?? t('none') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'

import type { HistoryStatusChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryStatusChangeViewModel }>()

const { t } = useI18n({
  en: { none: 'None', status: 'Status' },
  ru: { none: 'Нет', status: 'Статус' },
})
</script>
