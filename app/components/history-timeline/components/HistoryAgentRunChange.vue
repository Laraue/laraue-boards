<template>
  <span>{{ t('agent') }}:</span>
  <div class="history-value-change">
    <span>{{ change.oldState ? t(change.oldState) : t('none') }}</span>
    <IconArrowRight />
    <span class="history-new-value">{{ t(change.newState) }}</span>
  </div>
</template>

<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'

import type { HistoryAgentRunChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryAgentRunChangeViewModel }>()

const { t } = useI18n({
  en: {
    agent: 'Agent',
    cancelled: 'Cancelled',
    done: 'Done',
    failed: 'Failed',
    none: 'None',
    ready: 'Handed off',
    working: 'Working',
  },
  ru: {
    agent: 'Агент',
    cancelled: 'Отменено',
    done: 'Готово',
    failed: 'Не удалось',
    none: 'Нет',
    ready: 'Передана',
    working: 'В работе',
  },
})
</script>
