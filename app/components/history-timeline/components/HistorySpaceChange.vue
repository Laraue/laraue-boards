<template>
  <span>{{ t('space') }}:</span>
  <div class="history-value-change">
    <span :title="change.oldValue ?? t('none')">
      <SpaceIcon :style="{ color: change.oldColor ?? undefined }" />
      {{ change.oldValue ?? t('none') }}
    </span>
    <ArrowRight />
    <span
      class="history-new-value"
      :title="change.newValue ?? t('none')">
      <SpaceIcon :style="{ color: change.newColor ?? undefined }" />
      {{ change.newValue ?? t('none') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import { SpaceIcon } from '~/constants/icons'

import type { HistorySpaceChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistorySpaceChangeViewModel }>()

const { t } = useI18n({
  en: { none: 'None', space: 'Space' },
  ru: { none: 'Нет', space: 'Раздел' },
})
</script>
