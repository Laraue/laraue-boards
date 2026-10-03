<template>
  <span>{{ t('board') }}:</span>
  <div class="history-value-change">
    <span :title="change.oldValue ?? t('none')">
      <BoardIcon :style="{ color: change.oldColor ?? undefined }" />
      {{ change.oldValue ?? t('none') }}
    </span>
    <IconArrowRight />
    <span
      class="history-new-value"
      :title="change.newValue ?? t('none')">
      <BoardIcon :style="{ color: change.newColor ?? undefined }" />
      {{ change.newValue ?? t('none') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'

import { BoardIcon } from '~/constants/icons'

import type { HistoryBoardChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryBoardChangeViewModel }>()

const { t } = useI18n({
  en: { board: 'Board', none: 'None' },
  ru: { board: 'Доска', none: 'Нет' },
})
</script>
