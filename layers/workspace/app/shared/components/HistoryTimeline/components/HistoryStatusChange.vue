<template>
  <span>{{ t('status') }}:</span>
  <div class="history-value-change">
    <span :title="change.oldValue ?? t('none')">
      <StatusIndicator
        v-if="change.oldColor"
        :category="change.oldCategory ?? undefined"
        :color="change.oldColor" />
      {{ change.oldValue ?? t('none') }}
    </span>
    <IconArrowRight />
    <span
      class="history-new-value"
      :title="change.newValue ?? t('none')">
      <StatusIndicator
        v-if="change.newColor"
        :category="change.newCategory ?? undefined"
        :color="change.newColor" />
      {{ change.newValue ?? t('none') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import StatusIndicator from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusIndicator.vue'

import type { HistoryStatusChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryStatusChangeViewModel }>()

const { t } = useI18n({
  en: { none: 'None', status: 'Status' },
  ru: { none: 'Нет', status: 'Статус' },
})
</script>
