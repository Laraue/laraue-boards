<template>
  <span>{{ t('title') }}:</span>
  <div class="history-value-change">
    <span :title="change.oldValue ?? t('none')">
      {{ change.oldValue ?? t('none') }}
    </span>
    <ArrowRight />
    <span
      class="history-new-value"
      :title="change.newValue ?? t('none')">
      {{ change.newValue ?? t('none') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import type { HistoryTitleChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryTitleChangeViewModel }>()

const { t } = useI18n({
  en: { none: 'None', title: 'Title' },
  ru: { none: 'Нет', title: 'Заголовок' },
})
</script>
